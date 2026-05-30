import { registerFaAppDetailsIpc } from './registerFaAppDetailsIpc'
import { registerFaAppConfigIpc } from './registerFaAppConfigIpc'
import { registerFaAppNoteboardIpc } from './registerFaAppNoteboardIpc'
import { registerFaAppStylingIpc } from './registerFaAppStylingIpc'
import { registerFaDevToolsIpc } from './registerFaDevToolsIpc'
import { registerFaExtraEnvIpc } from './registerFaExtraEnvIpc'
import { registerFaExternalLinksIpc } from './registerFaExternalLinksIpc'
import { registerFaKeybindsIpc } from './registerFaKeybindsIpc'
import { registerFaProjectManagementIpc } from './registerFaProjectManagementIpc'
import { registerFaProjectOsOpenIpc } from './registerFaProjectOsOpenIpc'
import { registerFaUserSettingsIpc } from './registerFaUserSettingsIpc'
import { registerFaWindowControlIpc } from './registerFaWindowControlIpc'
import { installFaProjectFailsafePathReplyListener } from './faProjectFailsafePathFromRendererWiring'

/**
 * Registers all preload-facing ipcMain handlers and related main-process listeners.
 * Safe to call once from app startup; individual registerFa* modules no-op on repeat.
 */
export function registerAllFaIpc (): void {
  registerFaDevToolsIpc()
  registerFaExtraEnvIpc()
  registerFaExternalLinksIpc()
  registerFaKeybindsIpc()
  registerFaAppConfigIpc()
  installFaProjectFailsafePathReplyListener()
  registerFaProjectOsOpenIpc()
  registerFaProjectManagementIpc()
  registerFaAppNoteboardIpc()
  registerFaAppStylingIpc()
  registerFaUserSettingsIpc()
  registerFaWindowControlIpc()
  registerFaAppDetailsIpc()
}
