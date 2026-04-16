import { Notify } from 'quasar'

import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import { i18n } from 'app/i18n/externalFileLoader'

export type I_faKeybindsUpdatePatch = {
  overrides?: I_faKeybindsRoot['overrides']
  replaceAllOverrides?: boolean
}

/**
 * Persists keybind overrides via the preload bridge, refreshes snapshot, and surfaces success or save errors.
 */
export async function runFaKeybindsUpdateKeybinds (
  patch: I_faKeybindsUpdatePatch,
  refreshKeybinds: () => Promise<void>
): Promise<boolean> {
  const api = window.faContentBridgeAPIs?.faKeybinds
  if (typeof api?.setKeybinds !== 'function') {
    return false
  }

  try {
    await api.setKeybinds(patch)
  } catch (error) {
    console.error('[S_FaKeybinds] setKeybinds failed', error)
    Notify.create({
      group: false,
      message: i18n.global.t('globalFunctionality.faKeybinds.saveError'),
      timeout: 0,
      type: 'negative'
    })
    return false
  }

  await refreshKeybinds()

  Notify.create({
    group: false,
    message: i18n.global.t('globalFunctionality.faKeybinds.saveSuccess'),
    type: 'positive'
  })
  return true
}
