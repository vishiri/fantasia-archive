import fs from 'node:fs'

import type { IpcMainInvokeEvent } from 'electron'
import type { OpenDialogOptions } from 'electron'
import { dialog } from 'electron'

import { windowFromIpcEvent } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/windowManagement_manager'
import { FA_PROJECT_FILE_EXTENSION } from 'app/src-electron/shared/faProjectConstants'
import type { I_faProjectOpenInputParsed } from 'app/types/I_faProjectOpenInputParsed'
import type { I_faProjectOpenResolveResult } from 'app/types/I_faProjectManagementElectronMain'

import { faProjectSaveDialogDefaultDirectory } from './faProjectFileDialogDefaultPathsWiring'
import { takeNextE2eProjectOpenPath } from './projectManagementSharedE2ePathWiring'
import { pathLooksLikeFaProjectFile } from './projectManagementSharedPathWiring'

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

function resolveExplicitIpcOpenPath (
  ipcPath: string
): I_faProjectOpenResolveResult {
  if (!pathLooksLikeFaProjectFile(ipcPath)) {
    return {
      attemptedFilePath: ipcPath,
      errorMessage: 'Selected file must be a .faproject file',
      errorName: 'FileError',
      ipcExplicitPathFailed: true
    }
  }
  if (!fs.existsSync(ipcPath)) {
    return {
      attemptedFilePath: ipcPath,
      errorMessage: 'Project file does not exist',
      errorName: 'FileError',
      ipcExplicitPathFailed: true
    }
  }
  return {
    filePath: ipcPath,
    ipcExplicitPath: true
  }
}

/**
 * Resolves path for open: explicit IPC filePath (MRU / known path), else E2E queue, else native dialog.
 */
export async function resolveFaProjectOpenTargetPath (
  event: IpcMainInvokeEvent,
  parsed: I_faProjectOpenInputParsed
): Promise<I_faProjectOpenResolveResult> {
  const ipcPath = parsed.filePath
  if (ipcPath !== undefined && ipcPath.length > 0) {
    return resolveExplicitIpcOpenPath(ipcPath)
  }

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
    return {
      filePath: e2ePath,
      ipcExplicitPath: false
    }
  }

  const defaultDir = faProjectSaveDialogDefaultDirectory()
  const senderWin = windowFromIpcEvent(event) ?? appWindow
  const opts = buildOpenDialogOptions(defaultDir)
  const { canceled, filePaths } = senderWin != null
    ? await dialog.showOpenDialog(senderWin, opts)
    : await dialog.showOpenDialog(opts)
  if (canceled) {
    return { canceled: true }
  }
  const first = filePaths[0]
  if (first === undefined || first.length === 0) {
    return { canceled: true }
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
  return {
    filePath: first,
    ipcExplicitPath: false
  }
}
