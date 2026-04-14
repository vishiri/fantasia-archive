import { openDialogComponent } from 'app/src/scripts/appInfo/openDialogMarkdownDocument'
import { toggleDevTools } from 'app/src/scripts/appInfo/toggleDevTools'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

/**
 * Executes the action for a matched keybind command id.
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
