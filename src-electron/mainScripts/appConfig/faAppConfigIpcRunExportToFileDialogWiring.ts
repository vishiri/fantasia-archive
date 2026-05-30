import type { SaveDialogOptions } from 'electron'
import { dialog } from 'electron'
import { writeFile } from 'node:fs/promises'
import type { IpcMainInvokeEvent } from 'electron'
import { Result, ResultAsync } from 'neverthrow'

import { getFaKeybinds } from 'app/src-electron/mainScripts/keybinds/keybinds_manager'
import { windowFromIpcEvent } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import { getFaAppConfigExportSaveDefaultPath } from 'app/src-electron/mainScripts/appConfig/faAppConfigFileDialogDefaultPathsWiring'
import { zipAppConfigBundle } from 'app/src-electron/mainScripts/appConfig/faAppConfigBundleWiring'
import { getFaAppNoteboard } from 'app/src-electron/mainScripts/appNoteboard/appNoteboard_manager'
import { getFaAppStyling } from 'app/src-electron/mainScripts/appStyling/appStyling_manager'
import { getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettings_manager'
import { takeNextE2eAppConfigExportPath } from 'app/src-electron/mainScripts/appConfig/faAppConfigE2ePathOverrideWiring'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/windowManagement_manager'
import type { I_faAppConfigExportOptions, I_faAppConfigExportResult } from 'app/types/I_faAppConfigDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'
import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

async function tryWriteE2eExportPath (zipped: Uint8Array): Promise<I_faAppConfigExportResult | null> {
  const e2ePath = takeNextE2eAppConfigExportPath()
  if (e2ePath === null) {
    return null
  }
  const writeResult = await ResultAsync.fromPromise(
    writeFile(e2ePath, zipped),
    (e): unknown => e
  )
  if (writeResult.isOk()) {
    return {
      filePath: e2ePath,
      outcome: 'saved'
    }
  }
  const e = writeResult.error
  const err = e instanceof Error ? e : new Error(String(e))
  console.error('[faAppConfig] e2e write failed', {
    e2ePath,
    err
  })
  return {
    errorMessage: err.message,
    errorName: err.name,
    outcome: 'error'
  }
}

function validateFaAppConfigExportPayload (
  o: unknown
): I_faAppConfigExportResult | null {
  if (typeof o !== 'object' || o === null) {
    return {
      errorName: 'TypeError',
      errorMessage: 'export options must be an object',
      outcome: 'error'
    }
  }
  const opts = o as I_faAppConfigExportOptions
  if (
    typeof opts.includeKeybinds !== 'boolean' ||
    typeof opts.includeAppNoteboard !== 'boolean' ||
    typeof opts.includeAppSettings !== 'boolean' ||
    typeof opts.includeAppStyling !== 'boolean'
  ) {
    return {
      errorMessage: 'include flags must be booleans',
      errorName: 'TypeError',
      outcome: 'error'
    }
  }
  if (!opts.includeKeybinds && !opts.includeAppNoteboard && !opts.includeAppSettings && !opts.includeAppStyling) {
    return {
      errorMessage: 'at least one include flag is required',
      errorName: 'RangeError',
      outcome: 'error'
    }
  }
  return null
}

function buildAppConfigExportInputs (o: I_faAppConfigExportOptions): {
  keybinds?: I_faKeybindsRoot
  appNoteboard?: I_faAppNoteboardRoot
  appStyling?: I_faAppStylingRoot
  userSettings?: I_faUserSettings
} {
  const inputs: {
    keybinds?: I_faKeybindsRoot
    appNoteboard?: I_faAppNoteboardRoot
    appStyling?: I_faAppStylingRoot
    userSettings?: I_faUserSettings
  } = {}
  if (o.includeKeybinds) {
    inputs.keybinds = { ...getFaKeybinds().store }
  }
  if (o.includeAppNoteboard) {
    inputs.appNoteboard = { ...getFaAppNoteboard().store }
  }
  if (o.includeAppSettings) {
    inputs.userSettings = { ...getFaUserSettings().store }
  }
  if (o.includeAppStyling) {
    inputs.appStyling = { ...getFaAppStyling().store }
  }
  return inputs
}

/**
 * Zips the selected store JSON snapshots, prompts for a save path, and writes a '.faconfig' file.
 */
export async function runExportAppConfigToFile (
  event: IpcMainInvokeEvent,
  o: I_faAppConfigExportOptions
): Promise<I_faAppConfigExportResult> {
  const validation = validateFaAppConfigExportPayload(o)
  if (validation !== null) {
    return validation
  }

  const inputs = buildAppConfigExportInputs(o)

  const zipResult = Result.fromThrowable(
    (): Uint8Array => zipAppConfigBundle(inputs),
    (e): unknown => e
  )()

  if (zipResult.isErr()) {
    const e = zipResult.error
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[faAppConfig] zip failed', err)
    return {
      errorMessage: err.message,
      errorName: err.name,
      outcome: 'error'
    }
  }

  const zipped = zipResult.value

  const e2eR = await tryWriteE2eExportPath(zipped)
  if (e2eR !== null) {
    return e2eR
  }

  const win = windowFromIpcEvent(event) ?? appWindow
  const saveOpts: SaveDialogOptions = {
    defaultPath: getFaAppConfigExportSaveDefaultPath(),
    filters: [
      {
        extensions: ['faconfig'],
        name: 'Fantasia app configuration'
      }
    ],
    title: 'Export app configuration'
  }
  const { canceled, filePath } = win !== undefined
    ? await dialog.showSaveDialog(win, saveOpts)
    : await dialog.showSaveDialog(saveOpts)
  if (canceled || filePath === undefined) {
    return { outcome: 'canceled' }
  }

  const finalWriteResult = await ResultAsync.fromPromise(
    writeFile(filePath, zipped),
    (e): unknown => e
  )
  if (finalWriteResult.isOk()) {
    return {
      filePath,
      outcome: 'saved'
    }
  }
  const e = finalWriteResult.error
  const err = e instanceof Error ? e : new Error(String(e))
  console.error('[faAppConfig] write failed', {
    err,
    filePath
  })
  return {
    errorMessage: err.message,
    errorName: err.name,
    outcome: 'error'
  }
}
