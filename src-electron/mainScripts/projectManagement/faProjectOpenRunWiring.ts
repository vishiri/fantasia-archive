import type Database from 'better-sqlite3'

import type { IpcMainInvokeEvent } from 'electron'
import { Result } from 'neverthrow'
import { ZodError } from 'zod'

import { parseFaProjectOpenInput } from 'app/src-electron/shared/faProjectOpenInputSchema'
import {
  FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE,
  type I_faProjectManagementActiveSnapshot,
  type I_faProjectOpenResult
} from 'app/types/I_faProjectManagementDomain'

import {
  buildFaProjectIdempotentOpenResult,
  FaProjectOpenRejectedAlreadyActiveError
} from './faProjectOpenAlreadyActiveWiring'
import {
  getFaProjectActiveDatabase,
  getFaProjectLastKnownActiveProjectFilePath,
  openFaProjectDatabase,
  replaceFaProjectActiveDatabase
} from './faProjectActiveDatabaseWiring'
import { applyFaProjectMigrations } from './faProjectDbMigrateWiring'
import {
  assertFaProjectDatabaseQuickCheck,
  readFaProjectStoredDisplayName,
  readFaProjectStoredProjectUuid
} from './faProjectDbMigrateMetaWiring'
import {
  faDisplayNameFallbackFromProjectPath
} from './projectManagementSharedPathWiring'
import { resolveFaProjectOpenTargetPath } from './faProjectOpenResolveTargetPathWiring'
import {
  recordRecentProjectEntry,
  removeRecentProjectEntryByPath
} from './faRecentProjectListRuntimeWiring'

function readFaProjectActiveSnapshotForReuse (
  preferredFilePath: string
): I_faProjectManagementActiveSnapshot | null {
  const activeDbHandle = getFaProjectActiveDatabase()
  if (activeDbHandle === null) {
    return null
  }
  const mirroredPath = getFaProjectLastKnownActiveProjectFilePath()
  const filePath =
    mirroredPath !== null && mirroredPath.length > 0
      ? mirroredPath
      : preferredFilePath
  const id = readFaProjectStoredProjectUuid(activeDbHandle)
  const name = readFaProjectStoredDisplayName(activeDbHandle)
  return {
    filePath,
    id,
    name
  }
}

function normalizeFaProjectOpenFailure (e: unknown): Error {
  if (e instanceof Error) {
    return e
  }
  if (typeof e === 'string') {
    return new Error(e)
  }
  const serialized = Result.fromThrowable(
    () => JSON.stringify(e),
    () => undefined
  )()
  if (serialized.isOk()) {
    return new Error(serialized.value)
  }
  return new Error('Unexpected failure opening project')
}

function closeOpenAttemptDb (db: Database | null): void {
  if (db === null) {
    return
  }
  void Result.fromThrowable(
    (): void => {
      db.close()
    },
    (): undefined => undefined
  )()
}

function faProjectOpenErrorResult (
  errorMessage: string,
  errorName: string
): I_faProjectOpenResult {
  const outcome = 'error' as const
  return {
    errorMessage,
    errorName,
    outcome
  }
}

function ipcParseFailureResult (e: unknown): I_faProjectOpenResult {
  if (e instanceof TypeError) {
    return faProjectOpenErrorResult(e.message, e.name)
  }
  if (e instanceof ZodError) {
    const first = e.issues[0]
    const msg = first?.message ?? 'invalid project open input'
    return {
      errorMessage: msg,
      errorName: 'ZodError',
      outcome: 'error'
    }
  }
  const err = e instanceof Error ? e : new Error(String(e))
  return faProjectOpenErrorResult(err.message, err.name)
}

function attemptOpenReplaceFaProject (
  filePath: string
): Result<I_faProjectManagementActiveSnapshot, unknown> {
  let db: Database | null = null
  const opened = Result.fromThrowable((): I_faProjectManagementActiveSnapshot => {
    db = openFaProjectDatabase(filePath)
    db.pragma('foreign_keys = ON')
    db.pragma('busy_timeout = 5000')
    db.pragma('journal_mode = DELETE')
    const fallbackName = faDisplayNameFallbackFromProjectPath(filePath)
    applyFaProjectMigrations(db, fallbackName)
    assertFaProjectDatabaseQuickCheck(db)
    const displayName = readFaProjectStoredDisplayName(db)
    const candidateUuid = readFaProjectStoredProjectUuid(db)
    const activeDbHandle = getFaProjectActiveDatabase()
    if (activeDbHandle !== null) {
      const activeUuid = readFaProjectStoredProjectUuid(activeDbHandle)
      if (activeUuid === candidateUuid) {
        throw new FaProjectOpenRejectedAlreadyActiveError()
      }
    }
    replaceFaProjectActiveDatabase(db, filePath)
    db = null
    return {
      filePath,
      id: candidateUuid,
      name: displayName
    }
  }, (e): unknown => e)()

  closeOpenAttemptDb(db)

  return opened
}

/**
 * Opens an existing '.faproject' from IPC (native open dialog, optional path, or E2E path override); replaces active DB on success.
 */
export async function runFaProjectOpenFromIpc (
  event: IpcMainInvokeEvent,
  raw: unknown
): Promise<I_faProjectOpenResult> {
  const parsedResult = Result.fromThrowable(
    () => parseFaProjectOpenInput(raw),
    (error: unknown) => error
  )()
  if (parsedResult.isErr()) {
    return ipcParseFailureResult(parsedResult.error)
  }
  const parsed = parsedResult.value

  const target = await resolveFaProjectOpenTargetPath(event, parsed)
  if ('canceled' in target && target.canceled) {
    return { outcome: 'canceled' }
  }
  if ('errorMessage' in target) {
    if (target.ipcExplicitPathFailed === true && target.attemptedFilePath !== undefined) {
      removeRecentProjectEntryByPath(target.attemptedFilePath)
    }
    const errorResult: I_faProjectOpenResult = {
      errorMessage: target.errorMessage,
      errorName: target.errorName,
      outcome: 'error'
    }

    if (target.attemptedFilePath !== undefined) {
      errorResult.attemptedFilePath = target.attemptedFilePath
    }

    return errorResult
  }

  if (!('filePath' in target)) {
    return {
      errorMessage: 'Unable to resolve project file to open',
      errorName: 'FileError',
      outcome: 'error'
    }
  }

  const filePath = target.filePath
  const ipcExplicitPath = target.ipcExplicitPath

  const opened = attemptOpenReplaceFaProject(filePath)

  if (opened.isErr()) {
    const rawErr = opened.error
    if (rawErr instanceof FaProjectOpenRejectedAlreadyActiveError) {
      return buildFaProjectIdempotentOpenResult(
        filePath,
        rawErr,
        readFaProjectActiveSnapshotForReuse(filePath)
      )
    }
    const err = normalizeFaProjectOpenFailure(rawErr)
    console.error('[faProjectManagement] open failed', {
      err,
      filePath
    })
    if (
      ipcExplicitPath &&
      err.name !== FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE
    ) {
      removeRecentProjectEntryByPath(filePath)
    }
    const errorMessage = err.message
    const errorName = err.name
    const outcome = 'error' as const
    return {
      attemptedFilePath: filePath,
      errorMessage,
      errorName,
      outcome
    }
  }

  recordRecentProjectEntry({
    filePath: opened.value.filePath,
    name: opened.value.name
  })

  const outcome = 'opened' as const
  const project = opened.value
  return {
    outcome,
    project
  }
}
