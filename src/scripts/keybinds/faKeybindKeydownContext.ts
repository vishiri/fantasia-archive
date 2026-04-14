import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

/**
 * Snapshot read for the global keydown matcher (Pinia store + platform from main).
 */
export function getFaKeybindKeydownContext (): {
  overrides: I_faKeybindsRoot['overrides']
  platform: NodeJS.Platform
  suspendGlobalKeybindDispatch: boolean
} {
  const keybinds = S_FaKeybinds()
  const snap = keybinds.snapshot
  return {
    overrides: snap?.store.overrides ?? {},
    platform: snap?.platform ?? 'win32',
    suspendGlobalKeybindDispatch: keybinds.suspendGlobalKeybindDispatch
  }
}
