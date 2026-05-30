import type Database from 'better-sqlite3'

import type { IpcMainInvokeEvent } from 'electron'
import type { SaveDialogOptions } from 'electron'
import { dialog } from 'electron'
import { Result } from 'neverthrow'
import { windowFromIpcEvent } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import { parseFaProjectCreateInput } from 'app/src-electron/shared/faProjectCreateInputSchema'
import { FA_PROJECT_FILE_EXTENSION } from 'app/src-electron/shared/faProjectConstants'
import type { I_faProjectCreateResult, I_faProjectManagementActiveSnapshot } from 'app/types/I_faProjectManagementDomain'

import {
  openFaProjectDatabase,
  replaceFaProjectActiveDatabase,
  unlinkFaProjectFileIfExists
} from './faProjectActiveDatabase'
import {
  applyFaProjectMigrations,
  assertFaProjectDatabaseQuickCheck,
  readFaProjectStoredProjectUuid
} from './faProjectDbMigrate'
import { getFaProjectSaveDefaultPath } from './faProjectFileDialogDefaultPaths'
import { takeNextE2eProjectCreatePath } from './projectManagement_manager'
import {
  ensureFaProjectExtension,
  pathLooksLikeFaProjectFile
} from './projectManagement_manager'
import { faProjectCreateMapParseFailure } from './faProjectCreateIpcParseFailure'
import { faProjectSlugFromDisplayName } from './projectManagement_manager'
import { recordRecentProjectEntry } from './faRecentProjectListRuntime'

function buildSaveDialogOptions (defaultPath: string): SaveDialogOptions {
  return {
    defaultPath,
    filters: [
      {
        extensions: [FA_PROJECT_FILE_EXTENSION],
        name: 'Fantasia Archive project'
      }
    ],
    title: 'Create Fantasia Archive project'
  }
}

async function resolveCreateTargetPath (
  event: IpcMainInvokeEvent,
  displayName: string
): Promise<string | null | { errorMessage: string, errorName: string }> {
  const e2ePath = takeNextE2eProjectCreatePath()
  if (e2ePath != null) {
    if (!pathLooksLikeFaProjectFile(e2ePath)) {
      return {
        errorName: 'FileError',
        errorMessage: 'E2E project path must be an absolute .faproject file'
      }
    }
    return e2ePath
  }

  const slug = faProjectSlugFromDisplayName(displayName)
  const suggestedBasename = ensureFaProjectExtension(slug)
  const defaultFullPath = getFaProjectSaveDefaultPath(suggestedBasename)
  const win = windowFromIpcEvent(event) ?? appWindow
  const opts = buildSaveDialogOptions(defaultFullPath)
  const { canceled, filePath } = win !== undefined
    ? await dialog.showSaveDialog(win, opts)
    : await dialog.showSaveDialog(opts)
  let shouldAbortSave = false
  if (canceled) {
    shouldAbortSave = true
  } else if (filePath === undefined) {
    shouldAbortSave = true
  }
  if (shouldAbortSave) {
    return null
  }
  const withExt = ensureFaProjectExtension(filePath)
  if (!pathLooksLikeFaProjectFile(withExt)) {
    return {
      errorName: 'FileError',
      errorMessage: 'Save path must be a .faproject file'
    }
  }
  return withExt
}

/**
 * Creates a new '.faproject' file from an IPC payload (validated in main); updates the active DB handle on success.
 */
export async function runFaProjectCreateFromIpc (
  event: IpcMainInvokeEvent,
  raw: unknown
): Promise<I_faProjectCreateResult> {
  const parsedResult = Result.fromThrowable(
    (): ReturnType<typeof parseFaProjectCreateInput> => parseFaProjectCreateInput(raw),
    (e): unknown => e
  )()

  if (parsedResult.isErr()) {
    return faProjectCreateMapParseFailure(parsedResult.error)
  }

  const parsed = parsedResult.value

  const target = await resolveCreateTargetPath(event, parsed.projectName)
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
  unlinkFaProjectFileIfExists(filePath)

  let db: Database | null = null

  function cleanupAfterFailedCreate (): void {
    if (db !== null) {
      void Result.fromThrowable(
        (): void => {
          db!.close()
        },
        (): undefined => undefined
      )()
    }
    void Result.fromThrowable(
      (): void => unlinkFaProjectFileIfExists(filePath),
      (): undefined => undefined
    )()
  }

  const createResult = Result.fromThrowable((): I_faProjectManagementActiveSnapshot => {
    db = openFaProjectDatabase(filePath)
    db.pragma('foreign_keys = ON')
    db.pragma('busy_timeout = 5000')
    db.pragma('journal_mode = DELETE')
    applyFaProjectMigrations(db, parsed.projectName)
    assertFaProjectDatabaseQuickCheck(db)
    const projectUuid = readFaProjectStoredProjectUuid(db)
    replaceFaProjectActiveDatabase(db, filePath)
    db = null
    return {
      filePath,
      id: projectUuid,
      name: parsed.projectName
    }
  }, (e): unknown => e)()

  if (createResult.isErr()) {
    cleanupAfterFailedCreate()
    const err = createResult.error instanceof Error
      ? createResult.error
      : new Error(String(createResult.error))
    console.error('[faProjectManagement] create failed', {
      err,
      filePath
    })
    return {
      errorMessage: err.message,
      errorName: err.name,
      outcome: 'error'
    }
  }

  recordRecentProjectEntry({
    filePath: createResult.value.filePath,
    name: createResult.value.name
  })

  return {
    outcome: 'created',
    project: createResult.value
  }
}
