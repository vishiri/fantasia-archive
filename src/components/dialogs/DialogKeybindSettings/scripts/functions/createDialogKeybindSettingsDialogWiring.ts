import type {
  T_dialogKeybindSettingsDialogWiringApi,
  T_dialogKeybindSettingsDialogWiringFactoryBindings
} from 'app/types/I_dialogKeybindSettingsFactories'

export function createDialogKeybindSettingsDialogWiring (
  bindings: T_dialogKeybindSettingsDialogWiringFactoryBindings
): T_dialogKeybindSettingsDialogWiringApi {
  const {
    buildRegisterDialogKeybindSettingsGlobalSuspend,
    buildRunDialogKeybindSettingsOpen,
    buildSetupDialogKeybindSettingsDialogRouting,
    wiringDeps
  } = bindings

  const registerDialogKeybindSettingsGlobalSuspend = (
    params: Parameters<typeof buildRegisterDialogKeybindSettingsGlobalSuspend>[1]
  ): void => {
    buildRegisterDialogKeybindSettingsGlobalSuspend(wiringDeps, params)
  }

  const runDialogKeybindSettingsOpen = (
    params: Parameters<typeof buildRunDialogKeybindSettingsOpen>[1]
  ): void => {
    buildRunDialogKeybindSettingsOpen(wiringDeps, params)
  }

  const setupDialogKeybindSettingsDialogRouting = (
    params: Parameters<typeof buildSetupDialogKeybindSettingsDialogRouting>[1]
  ): ReturnType<typeof buildSetupDialogKeybindSettingsDialogRouting> => {
    return buildSetupDialogKeybindSettingsDialogRouting(wiringDeps, params)
  }

  return {
    registerDialogKeybindSettingsGlobalSuspend,
    runDialogKeybindSettingsOpen,
    setupDialogKeybindSettingsDialogRouting
  }
}
