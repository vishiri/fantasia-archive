import { openDialogComponent } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { toggleDevTools } from 'app/src/scripts/appGlobalManagementUI/toggleDevTools'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

/**
 * Executes the action for a matched keybind command id.
 * Kept in its own module (not inlined into the keydown dispatcher) so Vitest can mock this file without mocking the whole dispatch pipeline.
 */
export function faKeybindRunCommand (id: T_faKeybindCommandId): void {
  if (id === 'toggleDeveloperTools') {
    toggleDevTools()
    return
  }
  if (id === 'openProgramSettings') {
    openDialogComponent('ProgramSettings')
    return
  }
  openDialogComponent('KeybindSettings')
}
