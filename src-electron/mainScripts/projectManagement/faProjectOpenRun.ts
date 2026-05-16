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
  getFaProjectActiveDatabase,
  openFaProjectDatabase,
  replaceFaProjectActiveDatabase
} from './faProjectActiveDatabase'
import {
  applyFaProjectMigrations,
  assertFaProjectDatabaseQuickCheck,
  readFaProjectStoredDisplayName,
  readFaProjectStoredProjectUuid
} from './faProjectDbMigrate'
import {
  faDisplayNameFallbackFromProjectPath
} from './faProjectPathValidation'
import { resolveFaProjectOpenTargetPath } from './faProjectOpenResolveTargetPath'
import {
  recordRecentProjectEntry,
  removeRecentProjectEntryByPath
} from './faRecentProjectListRuntime'

function normalizeFaProjectOpenFailure (e: unknown): Error {
  if (e instanceof Error) {
    return e
  }
  if (typeof e === 'string') {
    return new Error(e)
  }
  try {
    return new Error(JSON.stringify(e))
  } catch {
    return new Error('Unexpected failure opening project')
  }
}

/**
 * Thrown when the file represents the same logical project (same `project_uuid`) as the already active database.
 */
class FaProjectOpenRejectedAlreadyActiveError extends Error {
  constructor () {
    super('This project is already open in this session.')
    this.name = 'FaProjectOpenRejectedAlreadyActiveError'
  }
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

function ipcParseFailureResult (e: unknown): I_faProjectOpenResult {
  if (e instanceof TypeError) {
    return {
      errorMessage: e.message,
      errorName: e.name,
      outcome: 'error'
    }
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
  return {
    errorMessage: err.message,
    errorName: err.name,
    outcome: 'error'
  }
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
  let parsed: ReturnType<typeof parseFaProjectOpenInput>
  try {
    parsed = parseFaProjectOpenInput(raw)
  } catch (e: unknown) {
    return ipcParseFailureResult(e)
  }

  const target = await resolveFaProjectOpenTargetPath(event, parsed)
  if ('canceled' in target && target.canceled) {
    return { outcome: 'canceled' }
  }
  if ('errorMessage' in target) {
    if (target.ipcExplicitPathFailed === true && target.attemptedFilePath !== undefined) {
      removeRecentProjectEntryByPath(target.attemptedFilePath)
    }
    return {
      attemptedFilePath: target.attemptedFilePath,
      errorMessage: target.errorMessage,
      errorName: target.errorName,
      outcome: 'error'
    }
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
      console.error('[faProjectManagement] open rejected — same project already active', {
        filePath
      })
      return {
        attemptedFilePath: filePath,
        errorMessage: rawErr.message,
        errorName: FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE,
        outcome: 'error'
      }
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
    return {
      attemptedFilePath: filePath,
      errorMessage: err.message,
      errorName: err.name,
      outcome: 'error'
    }
  }

  recordRecentProjectEntry({
    filePath: opened.value.filePath,
    name: opened.value.name
  })

  return {
    outcome: 'opened',
    project: opened.value
  }
}
