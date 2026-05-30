import type {
  T_dialogKeybindSettingsStateFactoryBindings,
  T_dialogKeybindSettingsSyncApi,
  T_useDialogKeybindSettingsResult
} from 'app/types/I_dialogKeybindSettingsFactories'

export function createDialogKeybindSettingsState (
  bindings: T_dialogKeybindSettingsStateFactoryBindings
): {
    createDialogKeybindSettingsSync: (
      params: Parameters<typeof bindings.createDialogKeybindSettingsSync>[1]
    ) => T_dialogKeybindSettingsSyncApi
    createDialogKeybindSettingsState: (
      t: (key: string) => string
    ) => ReturnType<typeof bindings.createDialogKeybindSettingsStateBundle>
    useDialogKeybindSettings: () => T_useDialogKeybindSettingsResult
  } {
  const {
    createDialogKeybindSettingsStateBundle: createStateBundleImpl,
    createDialogKeybindSettingsSync: createSyncImpl,
    stateDeps,
    useDialogKeybindSettingsFromDeps: useSettingsImpl
  } = bindings

  const createSync = (
    params: Parameters<typeof createSyncImpl>[1]
  ): T_dialogKeybindSettingsSyncApi => {
    return createSyncImpl(stateDeps, params)
  }

  const createState = (
    t: (key: string) => string
  ): ReturnType<typeof createStateBundleImpl> => {
    return createStateBundleImpl(stateDeps, t)
  }

  const useSettings = (): T_useDialogKeybindSettingsResult => {
    return useSettingsImpl(stateDeps)
  }

  return {
    createDialogKeybindSettingsState: createState,
    createDialogKeybindSettingsSync: createSync,
    useDialogKeybindSettings: useSettings
  }
}
