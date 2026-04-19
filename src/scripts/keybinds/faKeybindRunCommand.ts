import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'
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
  openProgramSettings: 'openProgramSettingsDialog',
  toggleDeveloperTools: 'toggleDeveloperTools'
}

/**
 * Executes the action for a matched keybind command id by dispatching it through the action manager.
 * Kept in its own module (not inlined into the keydown dispatcher) so Vitest can mock this file without mocking the whole dispatch pipeline.
 */
export function faKeybindRunCommand (id: T_faKeybindCommandId): void {
  const actionId = FA_KEYBIND_COMMAND_TO_ACTION_ID[id]
  runFaAction(actionId, undefined as never)
}
