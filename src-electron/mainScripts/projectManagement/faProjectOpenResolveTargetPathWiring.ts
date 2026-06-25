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
import { resolveHardenedFaProjectFilePath } from './faProjectFilePathHardeningWiring'

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
  const hardened = resolveHardenedFaProjectFilePath(ipcPath)
  if (hardened === null) {
    return {
      attemptedFilePath: ipcPath,
      errorMessage: ipcPath.trim().length === 0 || !pathLooksLikeFaProjectFile(ipcPath)
        ? 'Selected file must be a .faproject file'
        : 'Project file does not exist or is not a regular file',
      errorName: 'FileError',
      ipcExplicitPathFailed: true
    }
  }
  return {
    filePath: hardened,
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
    const hardened = resolveHardenedFaProjectFilePath(e2ePath)
    if (hardened === null) {
      return {
        errorMessage: 'E2E project path must be an absolute regular .faproject file',
        errorName: 'FileError'
      }
    }
    return {
      filePath: hardened,
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
  const hardened = resolveHardenedFaProjectFilePath(first)
  if (hardened === null) {
    return {
      errorMessage: !pathLooksLikeFaProjectFile(first)
        ? 'Selected file must be a .faproject file'
        : 'Project file does not exist or is not a regular file',
      errorName: 'FileError'
    }
  }
  return {
    filePath: hardened,
    ipcExplicitPath: false
  }
}
