import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import {
  openDialogComponent,
  openDialogMarkdownDocument
} from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { toggleDevTools } from 'app/src/scripts/appGlobalManagementUI/toggleDevTools'
import { tipsTricksTriviaNotification } from 'app/src/scripts/appGlobalManagementUI/tipsTricksTriviaNotification'
import { applyFaUserSettingsLanguageSelection } from 'app/src/scripts/appInternals/rendererAppInternals'

async function callBridge<T> (
  invoker: () => Promise<T> | T | undefined
): Promise<void> {
  const result = invoker()
  if (result instanceof Promise) {
    await result
  }
}

export async function handleSaveKeybindSettings (payload: { overrides: import('app/types/I_faKeybindsDomain').I_faKeybindsRoot['overrides'] }): Promise<void> {
  const ok = await S_FaKeybinds().updateKeybinds({
    overrides: payload.overrides,
    replaceAllOverrides: true
  })
  if (!ok) {
    throw new Error('Failed to save keybind settings.')
  }
}

export async function handleSaveProgramSettings (payload: { settings: import('app/types/I_faUserSettingsDomain').I_faUserSettings }): Promise<void> {
  await S_FaUserSettings().updateSettings(payload.settings)
}

export async function handleLanguageSwitch (
  payload: import('app/types/I_faActionManagerDomain').I_faActionPayloadMap['languageSwitch']
): Promise<void> {
  const faUserSettingsStore = S_FaUserSettings()
  await applyFaUserSettingsLanguageSelection(
    faUserSettingsStore.updateSettings,
    payload.code,
    payload.priorCode
  )
}

export async function handleResizeApp (): Promise<void> {
  const ctrl = window.faContentBridgeAPIs?.faWindowControl
  if (ctrl === undefined) {
    return
  }
  await callBridge(() => ctrl.resizeWindow())
  await callBridge(() => ctrl.checkWindowMaximized())
}

export async function handleMinimizeApp (): Promise<void> {
  const ctrl = window.faContentBridgeAPIs?.faWindowControl
  if (ctrl === undefined) {
    return
  }
  await callBridge(() => ctrl.minimizeWindow())
}

export async function handleCloseApp (): Promise<void> {
  const ctrl = window.faContentBridgeAPIs?.faWindowControl
  if (ctrl === undefined) {
    return
  }
  await callBridge(() => ctrl.closeWindow())
}

export async function handleRefreshWebContents (): Promise<void> {
  const ctrl = window.faContentBridgeAPIs?.faWindowControl
  if (ctrl === undefined) {
    return
  }
  await callBridge(() => ctrl.refreshWebContents())
}

export async function handleToggleDeveloperTools (): Promise<void> {
  toggleDevTools()
}

export async function handleOpenKeybindSettingsDialog (): Promise<void> {
  openDialogComponent('KeybindSettings')
}

export async function handleOpenProgramSettingsDialog (): Promise<void> {
  openDialogComponent('ProgramSettings')
}

export async function handleOpenAdvancedSearchGuideDialog (): Promise<void> {
  openDialogMarkdownDocument('advancedSearchGuide')
}

export async function handleOpenChangelogDialog (): Promise<void> {
  openDialogMarkdownDocument('changeLog')
}

export async function handleOpenLicenseDialog (): Promise<void> {
  openDialogMarkdownDocument('license')
}

export async function handleOpenAboutFantasiaArchiveDialog (): Promise<void> {
  openDialogComponent('AboutFantasiaArchive')
}

export async function handleOpenTipsTricksTriviaDialog (): Promise<void> {
  openDialogMarkdownDocument('tipsTricksTrivia')
}

export async function handleOpenActionMonitorDialog (): Promise<void> {
  openDialogComponent('ActionMonitor')
}

export async function handleShowStartupTipsNotification (): Promise<void> {
  tipsTricksTriviaNotification(false)
}
