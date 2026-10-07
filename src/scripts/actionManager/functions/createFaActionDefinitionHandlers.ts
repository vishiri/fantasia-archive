import type { I_faActionPayloadMap } from 'app/types/I_faActionManagerDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
type T_createFaActionDefinitionHandlersDeps = {
  notifyCreate: (options: { group: boolean, message: string, type: string }) => void
  i18n: { global: { t: (key: string) => string } }
  S_FaKeybinds: () => { updateKeybinds: (patch: { overrides: I_faKeybindsRoot['overrides']; replaceAllOverrides: boolean }) => Promise<boolean> }
  S_FaAppNoteboard: () => { isWindowOpen: boolean; setWindowOpen: (open: boolean) => void }
  S_FaProjectNoteboard: () => { isWindowOpen: boolean; setWindowOpen: (open: boolean) => void }
  S_FaActiveProject: () => { hasActiveProject: boolean }
  S_FaAppStyling: () => { updateAppStyling: (patch: { css: string }) => Promise<boolean> }
  S_FaProjectStyling: () => { savePersistedCssFromEditor: (css: string) => Promise<boolean> }
  S_FaUserSettings: () => {
    patchSettingsSilently: (patch: Partial<I_faUserSettings>) => Promise<void>
    settings: I_faUserSettings | null
    toggleHideHierarchyTreeSilently: () => Promise<void>
    updateSettings: (patch: Partial<I_faUserSettings>) => Promise<void>
  }
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

async function handleToggleHierarchicalTree (deps: T_createFaActionDefinitionHandlersDeps): Promise<void> {
  await deps.S_FaUserSettings().toggleHideHierarchyTreeSilently()
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
    throw new Error(deps.i18n.global.t('globalFunctionality.faKeybinds.saveError'))
  }
}

async function handleSaveAppSettings (
  deps: T_createFaActionDefinitionHandlersDeps,
  payload: { settings: I_faUserSettings }
): Promise<void> {
  await deps.S_FaUserSettings().updateSettings(payload.settings)
}

async function handleSaveAppStyling (
  deps: T_createFaActionDefinitionHandlersDeps,
  payload: { css: string }
): Promise<void> {
  const ok = await deps.S_FaAppStyling().updateAppStyling({ css: payload.css })
  if (!ok) {
    throw new Error(deps.i18n.global.t('globalFunctionality.faAppStyling.saveError'))
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
  handleToggleHierarchicalTree: () => Promise<void>
  handleReportProjectNoteboardSaveFailure: (payload: { message: string }) => Promise<void>
  handleToggleProjectNoteboardWindow: () => Promise<void>
  handleReportAppStylingPersistFailure: (payload: { message: string }) => Promise<void>
  handleReportProjectStylingSaveFailure: (payload: { message: string }) => Promise<void>
  handleReportBridgeLoadFailure: (payload: { message: string }) => Promise<void>
  handleSaveKeybindSettings: (payload: { overrides: I_faKeybindsRoot['overrides'] }) => Promise<void>
  handleSaveAppSettings: (payload: { settings: I_faUserSettings }) => Promise<void>
  handleSaveAppStyling: (payload: { css: string }) => Promise<void>
  handleSaveProjectStyling: (payload: { css: string }) => Promise<void>
  handleLanguageSwitch: (payload: I_faActionPayloadMap['languageSwitch']) => Promise<void>
} {
  const handleLanguageSwitchBound = (
    payload: I_faActionPayloadMap['languageSwitch']
  ): Promise<void> => {
    return handleLanguageSwitch(deps, payload)
  }
  const handleSaveAppSettingsBound = (
    payload: { settings: I_faUserSettings }
  ): Promise<void> => {
    return handleSaveAppSettings(deps, payload)
  }
  const handleSaveAppStylingBound = (payload: { css: string }): Promise<void> => {
    return handleSaveAppStyling(deps, payload)
  }
  const handleSaveKeybindSettingsBound = (
    payload: { overrides: I_faKeybindsRoot['overrides'] }
  ): Promise<void> => {
    return handleSaveKeybindSettings(deps, payload)
  }
  const handleSaveProjectStylingBound = (payload: { css: string }): Promise<void> => {
    return handleSaveProjectStyling(deps, payload)
  }
  const handleToggleAppNoteboardWindowBound = (): Promise<void> => {
    return handleToggleAppNoteboardWindow(deps)
  }
  const handleToggleHierarchicalTreeBound = (): Promise<void> => {
    return handleToggleHierarchicalTree(deps)
  }
  const handleToggleProjectNoteboardWindowBound = (): Promise<void> => {
    return handleToggleProjectNoteboardWindow(deps)
  }

  return {
    handleLanguageSwitch: handleLanguageSwitchBound,
    handleReportAppNoteboardSaveFailure,
    handleReportAppStylingPersistFailure,
    handleReportBridgeLoadFailure,
    handleReportProjectNoteboardSaveFailure,
    handleReportProjectStylingSaveFailure,
    handleSaveAppSettings: handleSaveAppSettingsBound,
    handleSaveAppStyling: handleSaveAppStylingBound,
    handleSaveKeybindSettings: handleSaveKeybindSettingsBound,
    handleSaveProjectStyling: handleSaveProjectStylingBound,
    handleToggleAppNoteboardWindow: handleToggleAppNoteboardWindowBound,
    handleToggleHierarchicalTree: handleToggleHierarchicalTreeBound,
    handleToggleProjectNoteboardWindow: handleToggleProjectNoteboardWindowBound
  }
}
