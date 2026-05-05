import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import type { I_faActionPayloadMap } from 'app/types/I_faActionManagerDomain'
import {
  openDialogComponent,
  openDialogMarkdownDocument
} from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { FaActionUserCanceledError } from 'app/src/scripts/actionManager/faActionUserCanceledError'
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

export async function handleSaveProgramStyling (payload: { css: string }): Promise<void> {
  const ok = await S_FaProgramStyling().updateProgramStyling({ css: payload.css })
  if (!ok) {
    throw new Error('Failed to save program styling.')
  }
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

export async function handleOpenProgramStylingWindow (): Promise<void> {
  openDialogComponent('WindowProgramStyling')
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

export async function handleOpenImportExportProgramConfigDialog (): Promise<void> {
  openDialogComponent('ImportExportProgramConfig')
}

export async function handleExportProgramConfigPackage (
  _payload: I_faActionPayloadMap['exportProgramConfigPackage']
): Promise<void> {
}

export async function handleExportProgramConfigSaveResult (
  payload: I_faActionPayloadMap['exportProgramConfigSaveResult']
): Promise<void> {
  if (payload.status === 'error') {
    throw new Error(payload.errorMessage ?? payload.errorName ?? 'Export to file failed')
  }
}

export async function handleImportProgramConfigStageResult (
  payload: I_faActionPayloadMap['importProgramConfigStageResult']
): Promise<void> {
  if (payload.status === 'fail') {
    throw new Error(payload.errorMessage ?? 'Import validation failed')
  }
}

export async function handleImportProgramConfigApply (
  payload: I_faActionPayloadMap['importProgramConfigApply']
): Promise<void> {
  const api = window.faContentBridgeAPIs?.faProgramConfig
  if (api === undefined) {
    throw new Error('Program configuration is only available in the desktop app.')
  }
  await api.applyImport(payload)
  await Promise.all([
    S_FaUserSettings().refreshSettings(),
    S_FaKeybinds().refreshKeybinds(),
    S_FaProgramStyling().refreshProgramStyling()
  ])
}

export async function handleOpenNewProjectSettingsDialog (): Promise<void> {
  openDialogComponent('NewProjectSettings')
}

export async function handleCreateNewProject (
  payload: I_faActionPayloadMap['createNewProject']
): Promise<void> {
  const outcome = await S_FaActiveProject().createProjectFromUserInput(payload.projectName)
  if (outcome === 'canceled') {
    throw new FaActionUserCanceledError()
  }
}

export async function handleShowStartupTipsNotification (): Promise<void> {
  tipsTricksTriviaNotification(false)
}
