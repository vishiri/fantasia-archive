import type { T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

/**
 * Maps a global keybind command id to the action manager id that should fire when the chord matches.
 * Centralized here so the keydown dispatcher stays small and Vitest can mock 'runFaAction' for routing tests.
 */
const FA_KEYBIND_COMMAND_TO_ACTION_ID: Readonly<Record<T_faKeybindCommandId, T_faActionId>> = {
  openActionMonitor: 'openActionMonitorDialog',
  openAdvancedSearchGuide: 'openAdvancedSearchGuideDialog',
  openKeybindSettings: 'openKeybindSettingsDialog',
  openAppSettings: 'openAppSettingsDialog',
  openAppStyling: 'openAppStylingWindow',
  openProjectStyling: 'openProjectStylingDialog',
  showProjectDashboard: 'showProjectDashboard',
  toggleDeveloperTools: 'toggleDeveloperTools',
  toggleAppNoteboard: 'toggleAppNoteboardWindow',
  toggleProjectNoteboard: 'toggleProjectNoteboardWindow'
}

export function createFaKeybindRunCommand (deps: {
  runFaAction: (id: T_faActionId, payload: never) => void
}): {
    faKeybindRunCommand: (id: T_faKeybindCommandId) => void
  } {
  const faKeybindRunCommand = (id: T_faKeybindCommandId): void => {
    const actionId = FA_KEYBIND_COMMAND_TO_ACTION_ID[id]
    deps.runFaAction(actionId, undefined as never)
  }

  return {
    faKeybindRunCommand
  }
}
