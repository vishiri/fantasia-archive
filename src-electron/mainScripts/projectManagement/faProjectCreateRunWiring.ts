import type Database from 'better-sqlite3'

import type { IpcMainInvokeEvent } from 'electron'
import type { SaveDialogOptions } from 'electron'
import { dialog } from 'electron'
import { Result } from 'neverthrow'
import { windowFromIpcEvent } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/windowManagement_manager'
import { parseFaProjectCreateInput } from 'app/src-electron/shared/faProjectCreateInputSchema'
import { FA_PROJECT_FILE_EXTENSION } from 'app/src-electron/shared/faProjectConstants'
import type { I_faProjectCreateResult, I_faProjectManagementActiveSnapshot } from 'app/types/I_faProjectManagementDomain'

import {
  discardFaProjectCreateBackupFile,
  faProjectCreateStagingFilePath,
  openFaProjectDatabase,
  promoteFaProjectCreateStagingFile,
  replaceFaProjectActiveDatabase,
  restoreFaProjectCreateBackupFile,
  unlinkFaProjectFileIfExists
} from './faProjectActiveDatabaseWiring'
import { applyFaProjectMigrations } from './faProjectDbMigrateWiring'
import {
  assertFaProjectDatabaseQuickCheck,
  readFaProjectStoredProjectUuid
} from './faProjectDbMigrateMetaWiring'
import { getFaProjectSaveDefaultPath } from './faProjectFileDialogDefaultPathsWiring'
import { takeNextE2eProjectCreatePath } from './projectManagementSharedE2ePathWiring'
import {
  ensureFaProjectExtension,
  faProjectSlugFromDisplayName,
  pathLooksLikeFaProjectFile
} from './projectManagementSharedPathWiring'
import { faProjectCreateMapParseFailure } from './faProjectCreateIpcParseFailureWiring'
import { recordRecentProjectEntry } from './faRecentProjectListRuntimeWiring'

function buildSaveDialogOptions (defaultPath: string): SaveDialogOptions {
  const filters: SaveDialogOptions['filters'] = [
    {
      extensions: [FA_PROJECT_FILE_EXTENSION],
      name: 'Fantasia Archive project'
    }
  ]
  const title = 'Create Fantasia Archive project'
  return {
    defaultPath,
    filters,
    title
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

function discardFaProjectCreateBackupBestEffort (filePath: string): void {
  void Result.fromThrowable(
    (): void => {
      discardFaProjectCreateBackupFile(filePath)
    },
    (): undefined => undefined
  )()
}

function failFaProjectCreate (input: {
  adoptedActiveDatabase: boolean
  cleanupAfterFailedCreate: () => void
  error: unknown
  filePath: string
  promotedStaging: boolean
}): I_faProjectCreateResult {
  input.cleanupAfterFailedCreate()
  if (input.promotedStaging && !input.adoptedActiveDatabase) {
    void Result.fromThrowable(
      (): void => {
        restoreFaProjectCreateBackupFile(input.filePath)
      },
      (): undefined => undefined
    )()
  }
  const err = input.error instanceof Error
    ? input.error
    : new Error(String(input.error))
  console.error('[faProjectManagement] create failed', {
    err,
    filePath: input.filePath
  })
  const errorMessage = err.message
  const errorName = err.name
  const outcome = 'error' as const
  return {
    errorMessage,
    errorName,
    outcome
  }
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
    const errorMessage = target.errorMessage
    const errorName = target.errorName
    const outcome = 'error' as const
    return {
      errorMessage,
      errorName,
      outcome
    }
  }

  const filePath = target
  const stagingPath = faProjectCreateStagingFilePath(filePath)
  unlinkFaProjectFileIfExists(stagingPath)

  let db: Database | null = null
  let promotedStaging = false
  let adoptedActiveDatabase = false

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
      (): void => unlinkFaProjectFileIfExists(stagingPath),
      (): undefined => undefined
    )()
  }

  const createResult = Result.fromThrowable((): I_faProjectManagementActiveSnapshot => {
    db = openFaProjectDatabase(stagingPath)
    db.pragma('foreign_keys = ON')
    db.pragma('busy_timeout = 5000')
    db.pragma('journal_mode = DELETE')
    applyFaProjectMigrations(db, parsed.projectName)
    assertFaProjectDatabaseQuickCheck(db)
    const projectUuid = readFaProjectStoredProjectUuid(db)
    const stagingDb = db
    db = null
    stagingDb.close()
    promoteFaProjectCreateStagingFile(stagingPath, filePath)
    promotedStaging = true
    const activeDb = openFaProjectDatabase(filePath)
    replaceFaProjectActiveDatabase(activeDb, filePath)
    adoptedActiveDatabase = true
    discardFaProjectCreateBackupBestEffort(filePath)
    const name = parsed.projectName
    return {
      filePath,
      id: projectUuid,
      name
    }
  }, (e): unknown => e)()

  if (createResult.isErr()) {
    return failFaProjectCreate({
      adoptedActiveDatabase,
      cleanupAfterFailedCreate,
      error: createResult.error,
      filePath,
      promotedStaging
    })
  }

  recordRecentProjectEntry({
    filePath: createResult.value.filePath,
    name: createResult.value.name
  })

  const outcome = 'created' as const
  const project = createResult.value
  return {
    outcome,
    project
  }
}
