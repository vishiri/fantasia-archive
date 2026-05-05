import type Database from 'better-sqlite3'

import { randomUUID } from 'node:crypto'

import type { IpcMainInvokeEvent } from 'electron'
import type { SaveDialogOptions } from 'electron'
import { dialog } from 'electron'
import { ZodError } from 'zod'

import { windowFromIpcEvent } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import { parseFaProjectCreateInput } from 'app/src-electron/shared/faProjectCreateInputSchema'
import { FA_PROJECT_FILE_EXTENSION } from 'app/src-electron/shared/faProjectConstants'
import type { I_faProjectCreateResult } from 'app/types/I_faProjectManagementDomain'

import {
  openFaProjectDatabase,
  replaceFaProjectActiveDatabase,
  unlinkFaProjectFileIfExists
} from './faProjectActiveDatabase'
import {
  applyFaProjectMigrations,
  assertFaProjectDatabaseQuickCheck
} from './faProjectDbMigrate'
import { getFaProjectSaveDefaultPath } from './faProjectFileDialogDefaultPaths'
import { takeNextE2eProjectCreatePath } from './faProjectManagementE2ePathOverride'
import {
  ensureFaProjectExtension,
  pathLooksLikeFaProjectFile
} from './faProjectPathValidation'
import { faProjectSlugFromDisplayName } from './faProjectSlugFromDisplayName'

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
  let parsed: ReturnType<typeof parseFaProjectCreateInput>
  try {
    parsed = parseFaProjectCreateInput(raw)
  } catch (e) {
    if (e instanceof TypeError) {
      return {
        errorMessage: e.message,
        errorName: e.name,
        outcome: 'error'
      }
    }
    if (e instanceof ZodError) {
      const first = e.issues[0]
      const msg = first?.message ?? 'invalid project create input'
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
  try {
    db = openFaProjectDatabase(filePath)
    db.pragma('foreign_keys = ON')
    db.pragma('busy_timeout = 5000')
    db.pragma('journal_mode = DELETE')
    applyFaProjectMigrations(db, parsed.projectName)
    assertFaProjectDatabaseQuickCheck(db)
    replaceFaProjectActiveDatabase(db)
  } catch (e) {
    try {
      if (db !== null) {
        db.close()
      }
    } catch {
      // ignore
    }
    try {
      unlinkFaProjectFileIfExists(filePath)
    } catch {
      // ignore
    }
    const err = e instanceof Error ? e : new Error(String(e))
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

  return {
    outcome: 'created',
    project: {
      filePath,
      id: randomUUID(),
      name: parsed.projectName
    }
  }
}
