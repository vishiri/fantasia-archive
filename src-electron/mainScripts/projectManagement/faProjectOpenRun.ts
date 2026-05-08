import fs from 'node:fs'

import type Database from 'better-sqlite3'

import type { IpcMainInvokeEvent } from 'electron'
import type { OpenDialogOptions } from 'electron'
import { dialog } from 'electron'
import { Result } from 'neverthrow'

import { windowFromIpcEvent } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import { FA_PROJECT_FILE_EXTENSION } from 'app/src-electron/shared/faProjectConstants'
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
import { faProjectSaveDialogDefaultDirectory } from './faProjectFileDialogDefaultPaths'
import { takeNextE2eProjectOpenPath } from './faProjectManagementE2ePathOverride'
import {
  faDisplayNameFallbackFromProjectPath,
  pathLooksLikeFaProjectFile
} from './faProjectPathValidation'

function buildOpenDialogOptions (defaultPath: string): OpenDialogOptions {
  return {
    defaultPath,
    filters: [
      {
        extensions: [FA_PROJECT_FILE_EXTENSION],
        name: 'Fantasia Archive project'
      }
    ],
    properties: ['openFile'],
    title: 'Open Fantasia Archive project'
  }
}

async function resolveOpenTargetPath (
  event: IpcMainInvokeEvent
): Promise<string | null | { errorMessage: string, errorName: string }> {
  const e2ePath = takeNextE2eProjectOpenPath()
  if (e2ePath != null) {
    if (!pathLooksLikeFaProjectFile(e2ePath)) {
      return {
        errorMessage: 'E2E project path must be an absolute .faproject file',
        errorName: 'FileError'
      }
    }
    if (!fs.existsSync(e2ePath)) {
      return {
        errorMessage: 'E2E project file does not exist',
        errorName: 'FileError'
      }
    }
    return e2ePath
  }

  const defaultDir = faProjectSaveDialogDefaultDirectory()
  const senderWin = windowFromIpcEvent(event) ?? appWindow
  const opts = buildOpenDialogOptions(defaultDir)
  const { canceled, filePaths } = senderWin != null
    ? await dialog.showOpenDialog(senderWin, opts)
    : await dialog.showOpenDialog(opts)
  if (canceled) {
    return null
  }
  const first = filePaths[0]
  if (first === undefined || first.length === 0) {
    return null
  }
  if (!pathLooksLikeFaProjectFile(first)) {
    return {
      errorMessage: 'Selected file must be a .faproject file',
      errorName: 'FileError'
    }
  }
  if (!fs.existsSync(first)) {
    return {
      errorMessage: 'Project file does not exist',
      errorName: 'FileError'
    }
  }
  return first
}

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

/**
 * Opens an existing '.faproject' from IPC (native open dialog or E2E path override); replaces active DB on success.
 */
export async function runFaProjectOpenFromIpc (
  event: IpcMainInvokeEvent,
  _raw: unknown
): Promise<I_faProjectOpenResult> {
  const target = await resolveOpenTargetPath(event)
  if (target === null) {
    return { outcome: 'canceled' }
  }
  if (typeof target === 'object' && 'errorMessage' in target) {
    return {
      errorMessage: target.errorMessage,
      errorName: target.errorName,
      outcome: 'error'
    }
  }

  const filePath = target
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
    replaceFaProjectActiveDatabase(db)
    db = null
    return {
      filePath,
      id: candidateUuid,
      name: displayName
    }
  }, (e): unknown => e)()

  closeOpenAttemptDb(db)

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
    return {
      attemptedFilePath: filePath,
      errorMessage: err.message,
      errorName: err.name,
      outcome: 'error'
    }
  }

  return {
    outcome: 'opened',
    project: opened.value
  }
}
