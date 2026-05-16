import { i18n } from 'app/i18n/externalFileLoader'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { canOpenAppNoteboardFloatingWindow } from 'app/src/scripts/appNoteboard/faAppNoteboardCanOpen'
import { toggleDevTools } from 'app/src/scripts/appGlobalManagementUI/toggleDevTools'
import { applyFaUserSettingsLanguageSelection } from 'app/src/scripts/appInternals/rendererAppInternals'

async function callBridge<T> (
  invoker: () => Promise<T> | T | undefined
): Promise<void> {
  const result = invoker()
  if (result instanceof Promise) {
    await result
  }
}

export async function handleReportAppNoteboardSaveFailure (payload: { message: string }): Promise<void> {
  throw new Error(payload.message)
}

export async function handleToggleAppNoteboardWindow (): Promise<void> {
  const store = S_FaAppNoteboard()
  if (store.isWindowOpen) {
    store.setWindowOpen(false)
    return
  }
  if (!canOpenAppNoteboardFloatingWindow()) {
    return
  }
  store.setWindowOpen(true)
}

export async function handleReportProjectNoteboardSaveFailure (payload: { message: string }): Promise<void> {
  throw new Error(payload.message)
}

export async function handleToggleProjectNoteboardWindow (): Promise<void> {
  const store = S_FaProjectNoteboard()
  if (store.isWindowOpen) {
    store.setWindowOpen(false)
    return
  }
  if (!S_FaActiveProject().hasActiveProject) {
    return
  }
  if (!canOpenAppNoteboardFloatingWindow()) {
    return
  }
  store.setWindowOpen(true)
}

export async function handleReportAppStylingPersistFailure (payload: { message: string }): Promise<void> {
  throw new Error(payload.message)
}

export async function handleReportProjectStylingSaveFailure (payload: { message: string }): Promise<void> {
  throw new Error(payload.message)
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

export async function handleSaveAppSettings (payload: { settings: import('app/types/I_faUserSettingsDomain').I_faUserSettings }): Promise<void> {
  await S_FaUserSettings().updateSettings(payload.settings)
}

export async function handleSaveAppStyling (payload: { css: string }): Promise<void> {
  const ok = await S_FaAppStyling().updateAppStyling({ css: payload.css })
  if (!ok) {
    throw new Error('Failed to save app styling.')
  }
}

export async function handleSaveProjectStyling (payload: { css: string }): Promise<void> {
  if (!S_FaActiveProject().hasActiveProject) {
    throw new Error(i18n.global.t('globalFunctionality.faProjectStyling.saveNoActiveProject'))
  }
  const ok = await S_FaProjectStyling().savePersistedCssFromEditor(payload.css)
  if (!ok) {
    throw new Error(i18n.global.t('globalFunctionality.faProjectStyling.saveRejected'))
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

export {
  handleCreateNewProject,
  handleExportAppConfigPackage,
  handleExportAppConfigSaveResult,
  handleImportAppConfigApply,
  handleImportAppConfigStageResult,
  handleLoadExistingProject,
  handleOpenAboutFantasiaArchiveDialog,
  handleOpenActionMonitorDialog,
  handleOpenAdvancedSearchGuideDialog,
  handleOpenChangelogDialog,
  handleOpenImportExportAppConfigDialog,
  handleOpenKeybindSettingsDialog,
  handleOpenLicenseDialog,
  handleOpenNewProjectDialog,
  handleOpenAppSettingsDialog,
  handleOpenAppStylingWindow,
  handleOpenProjectStylingWindow,
  handleOpenTipsTricksTriviaDialog,
  handleShowStartupTipsNotification
} from 'app/src/scripts/actionManager/faActionDefinitionHandlersDialogs'
