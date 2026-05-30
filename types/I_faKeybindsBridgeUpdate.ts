import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

/** Patch accepted by S_FaKeybinds.updateKeybinds before IPC persist. */
export type I_faKeybindsUpdatePatch = {
  overrides?: I_faKeybindsRoot['overrides']
  replaceAllOverrides?: boolean
}
