import type { SaveDialogOptions } from 'electron'
import { dialog } from 'electron'
import { writeFile } from 'node:fs/promises'
import type { IpcMainInvokeEvent } from 'electron'

import { getFaKeybinds } from 'app/src-electron/mainScripts/keybinds/faKeybindsStore'
import { windowFromIpcEvent } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import { getFaProgramConfigExportSaveDefaultPath } from 'app/src-electron/mainScripts/programConfig/faProgramConfigFileDialogDefaultPaths'
import { zipProgramConfigBundle } from 'app/src-electron/mainScripts/programConfig/faProgramConfigBundle'
import { getFaProgramStyling } from 'app/src-electron/mainScripts/programStyling/faProgramStylingStore'
import { getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettingsStore'
import { takeNextE2eProgramConfigExportPath } from 'app/src-electron/mainScripts/programConfig/faProgramConfigE2ePathOverride'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import type { I_faProgramConfigExportOptions, I_faProgramConfigExportResult } from 'app/types/I_faProgramConfigDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faProgramStylingRoot } from 'app/types/I_faProgramStylingDomain'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

async function tryWriteE2eExportPath (zipped: Uint8Array): Promise<I_faProgramConfigExportResult | null> {
  const e2ePath = takeNextE2eProgramConfigExportPath()
  if (e2ePath === null) {
    return null
  }
  try {
    await writeFile(e2ePath, zipped)
    return {
      filePath: e2ePath,
      outcome: 'saved'
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[faProgramConfig] e2e write failed', {
      e2ePath,
      err
    })
    return {
      errorMessage: err.message,
      errorName: err.name,
      outcome: 'error'
    }
  }
}

/**
 * Zips the selected store JSON snapshots, prompts for a save path, and writes a '.faconfig' file.
 */
export async function runExportProgramConfigToFile (
  event: IpcMainInvokeEvent,
  o: I_faProgramConfigExportOptions
): Promise<I_faProgramConfigExportResult> {
  if (typeof o !== 'object' || o === null) {
    return {
      errorName: 'TypeError',
      errorMessage: 'export options must be an object',
      outcome: 'error'
    }
  }
  if (
    typeof o.includeProgramSettings !== 'boolean' ||
    typeof o.includeKeybinds !== 'boolean' ||
    typeof o.includeProgramStyling !== 'boolean'
  ) {
    return {
      errorName: 'TypeError',
      errorMessage: 'include flags must be booleans',
      outcome: 'error'
    }
  }
  if (!o.includeProgramSettings && !o.includeKeybinds && !o.includeProgramStyling) {
    return {
      errorName: 'RangeError',
      errorMessage: 'at least one include flag is required',
      outcome: 'error'
    }
  }

  const inputs: {
    keybinds?: I_faKeybindsRoot
    programStyling?: I_faProgramStylingRoot
    userSettings?: I_faUserSettings
  } = {}
  if (o.includeProgramSettings) {
    inputs.userSettings = { ...getFaUserSettings().store }
  }
  if (o.includeKeybinds) {
    inputs.keybinds = { ...getFaKeybinds().store }
  }
  if (o.includeProgramStyling) {
    inputs.programStyling = { ...getFaProgramStyling().store }
  }

  let zipped: Uint8Array
  try {
    zipped = zipProgramConfigBundle(inputs)
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[faProgramConfig] zip failed', err)
    return {
      errorMessage: err.message,
      errorName: err.name,
      outcome: 'error'
    }
  }

  const e2eR = await tryWriteE2eExportPath(zipped)
  if (e2eR !== null) {
    return e2eR
  }

  const win = windowFromIpcEvent(event) ?? appWindow
  const saveOpts: SaveDialogOptions = {
    defaultPath: getFaProgramConfigExportSaveDefaultPath(),
    filters: [
      {
        extensions: ['faconfig'],
        name: 'Fantasia program configuration'
      }
    ],
    title: 'Export program configuration'
  }
  const { canceled, filePath } = win !== undefined
    ? await dialog.showSaveDialog(win, saveOpts)
    : await dialog.showSaveDialog(saveOpts)
  if (canceled || filePath === undefined) {
    return { outcome: 'canceled' }
  }

  try {
    await writeFile(filePath, zipped)
    return {
      filePath,
      outcome: 'saved'
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[faProgramConfig] write failed', {
      err,
      filePath
    })
    return {
      errorMessage: err.message,
      errorName: err.name,
      outcome: 'error'
    }
  }
}
