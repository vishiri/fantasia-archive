import type { I_faActionPayloadMap } from 'app/types/I_faActionManagerDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_faProjectSettingsPatch } from 'app/types/I_faProjectSettingsDomain'
import type { I_faProjectDocumentTemplateSnapshotItem } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'

type T_createFaActionDefinitionHandlersDeps = {
  i18n: { global: { t: (key: string) => string } }
  S_FaKeybinds: () => { updateKeybinds: (patch: { overrides: I_faKeybindsRoot['overrides']; replaceAllOverrides: boolean }) => Promise<boolean> }
  S_FaAppNoteboard: () => { isWindowOpen: boolean; setWindowOpen: (open: boolean) => void }
  S_FaProjectNoteboard: () => { isWindowOpen: boolean; setWindowOpen: (open: boolean) => void }
  S_FaActiveProject: () => { hasActiveProject: boolean }
  S_FaAppStyling: () => { updateAppStyling: (patch: { css: string }) => Promise<boolean> }
  S_FaProjectStyling: () => { savePersistedCssFromEditor: (css: string) => Promise<boolean> }
  S_FaProjectSettings: () => { updateProjectSettings: (patch: I_faProjectSettingsPatch) => Promise<void> }
  S_FaUserSettings: () => { updateSettings: (patch: Partial<I_faUserSettings>) => Promise<void> }
  faProjectWorldsPersistSnapshotFromDialog: (items: I_faProjectWorldSnapshotItem[]) => Promise<void>
  faProjectDocumentTemplatesPersistSnapshotFromDialog: (
    items: I_faProjectDocumentTemplateSnapshotItem[]
  ) => Promise<void>
  canOpenFloatingWindowWhileNoModal: () => boolean
  applyFaUserSettingsLanguageSelection: (
    updateSettings: (patch: Partial<I_faUserSettings>) => Promise<void>,
    languageCode: I_faUserSettings['languageCode'],
    currentLanguageCode: I_faUserSettings['languageCode']
  ) => Promise<void>
}

async function handleReportAppNoteboardSaveFailure (payload: { message: string }): Promise<void> {
  throw new Error(payload.message)
}

async function handleToggleAppNoteboardWindow (deps: T_createFaActionDefinitionHandlersDeps): Promise<void> {
  const store = deps.S_FaAppNoteboard()
  if (store.isWindowOpen) {
    store.setWindowOpen(false)
    return
  }
  if (!deps.canOpenFloatingWindowWhileNoModal()) {
    return
  }
  store.setWindowOpen(true)
}

async function handleReportProjectNoteboardSaveFailure (payload: { message: string }): Promise<void> {
  throw new Error(payload.message)
}

async function handleToggleProjectNoteboardWindow (deps: T_createFaActionDefinitionHandlersDeps): Promise<void> {
  const store = deps.S_FaProjectNoteboard()
  if (store.isWindowOpen) {
    store.setWindowOpen(false)
    return
  }
  if (!deps.S_FaActiveProject().hasActiveProject) {
    return
  }
  if (!deps.canOpenFloatingWindowWhileNoModal()) {
    return
  }
  store.setWindowOpen(true)
}

async function handleReportAppStylingPersistFailure (payload: { message: string }): Promise<void> {
  throw new Error(payload.message)
}

async function handleReportProjectStylingSaveFailure (payload: { message: string }): Promise<void> {
  throw new Error(payload.message)
}

async function handleReportBridgeLoadFailure (payload: { message: string }): Promise<void> {
  throw new Error(payload.message)
}

async function handleSaveKeybindSettings (
  deps: T_createFaActionDefinitionHandlersDeps,
  payload: { overrides: I_faKeybindsRoot['overrides'] }
): Promise<void> {
  const ok = await deps.S_FaKeybinds().updateKeybinds({
    overrides: payload.overrides,
    replaceAllOverrides: true
  })
  if (!ok) {
    throw new Error('Failed to save keybind settings.')
  }
}

async function handleSaveAppSettings (
  deps: T_createFaActionDefinitionHandlersDeps,
  payload: { settings: I_faUserSettings }
): Promise<void> {
  await deps.S_FaUserSettings().updateSettings(payload.settings)
}

async function handleSaveProjectSettings (
  deps: T_createFaActionDefinitionHandlersDeps,
  payload: {
    documentTemplates?: I_faProjectDocumentTemplateSnapshotItem[]
    settings: I_faProjectSettingsPatch
    worlds?: I_faProjectWorldSnapshotItem[]
  }
): Promise<void> {
  if (!deps.S_FaActiveProject().hasActiveProject) {
    throw new Error(deps.i18n.global.t('globalFunctionality.faProjectSettings.saveError'))
  }
  await deps.S_FaProjectSettings().updateProjectSettings(payload.settings)
  if (payload.worlds !== undefined) {
    await deps.faProjectWorldsPersistSnapshotFromDialog(payload.worlds)
  }
  if (payload.documentTemplates !== undefined) {
    await deps.faProjectDocumentTemplatesPersistSnapshotFromDialog(payload.documentTemplates)
  }
}

async function handleSaveAppStyling (
  deps: T_createFaActionDefinitionHandlersDeps,
  payload: { css: string }
): Promise<void> {
  const ok = await deps.S_FaAppStyling().updateAppStyling({ css: payload.css })
  if (!ok) {
    throw new Error('Failed to save app styling.')
  }
}

async function handleSaveProjectStyling (
  deps: T_createFaActionDefinitionHandlersDeps,
  payload: { css: string }
): Promise<void> {
  if (!deps.S_FaActiveProject().hasActiveProject) {
    throw new Error(deps.i18n.global.t('globalFunctionality.faProjectStyling.saveNoActiveProject'))
  }
  const ok = await deps.S_FaProjectStyling().savePersistedCssFromEditor(payload.css)
  if (!ok) {
    throw new Error(deps.i18n.global.t('globalFunctionality.faProjectStyling.saveRejected'))
  }
}

async function handleLanguageSwitch (
  deps: T_createFaActionDefinitionHandlersDeps,
  payload: I_faActionPayloadMap['languageSwitch']
): Promise<void> {
  const faUserSettingsStore = deps.S_FaUserSettings()
  await deps.applyFaUserSettingsLanguageSelection(
    faUserSettingsStore.updateSettings,
    payload.code,
    payload.priorCode
  )
}

export function createFaActionDefinitionHandlers (deps: T_createFaActionDefinitionHandlersDeps): {
  handleReportAppNoteboardSaveFailure: (payload: { message: string }) => Promise<void>
  handleToggleAppNoteboardWindow: () => Promise<void>
  handleReportProjectNoteboardSaveFailure: (payload: { message: string }) => Promise<void>
  handleToggleProjectNoteboardWindow: () => Promise<void>
  handleReportAppStylingPersistFailure: (payload: { message: string }) => Promise<void>
  handleReportProjectStylingSaveFailure: (payload: { message: string }) => Promise<void>
  handleReportBridgeLoadFailure: (payload: { message: string }) => Promise<void>
  handleSaveKeybindSettings: (payload: { overrides: I_faKeybindsRoot['overrides'] }) => Promise<void>
  handleSaveAppSettings: (payload: { settings: I_faUserSettings }) => Promise<void>
  handleSaveProjectSettings: (payload: {
    documentTemplates?: I_faProjectDocumentTemplateSnapshotItem[]
    settings: I_faProjectSettingsPatch
    worlds?: I_faProjectWorldSnapshotItem[]
  }) => Promise<void>
  handleSaveAppStyling: (payload: { css: string }) => Promise<void>
  handleSaveProjectStyling: (payload: { css: string }) => Promise<void>
  handleLanguageSwitch: (payload: I_faActionPayloadMap['languageSwitch']) => Promise<void>
} {
  return {
    handleLanguageSwitch: (payload) => handleLanguageSwitch(deps, payload),
    handleReportAppNoteboardSaveFailure,
    handleReportAppStylingPersistFailure,
    handleReportBridgeLoadFailure,
    handleReportProjectNoteboardSaveFailure,
    handleReportProjectStylingSaveFailure,
    handleSaveAppSettings: (payload) => handleSaveAppSettings(deps, payload),
    handleSaveAppStyling: (payload) => handleSaveAppStyling(deps, payload),
    handleSaveKeybindSettings: (payload) => handleSaveKeybindSettings(deps, payload),
    handleSaveProjectSettings: (payload) => handleSaveProjectSettings(deps, payload),
    handleSaveProjectStyling: (payload) => handleSaveProjectStyling(deps, payload),
    handleToggleAppNoteboardWindow: () => handleToggleAppNoteboardWindow(deps),
    handleToggleProjectNoteboardWindow: () => handleToggleProjectNoteboardWindow(deps)
  }
}
