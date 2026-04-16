import type { Ref } from 'vue'

import { Notify } from 'quasar'

import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'
import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Loads keybind snapshot from the preload bridge into the store ref, or shows a load error notification on failure.
 */
export async function runFaKeybindsRefreshKeybinds (
  snapshot: Ref<I_faKeybindsSnapshot | null>
): Promise<void> {
  const api = window.faContentBridgeAPIs?.faKeybinds
  if (typeof api?.getKeybinds !== 'function') {
    return
  }
  try {
    snapshot.value = await api.getKeybinds()
  } catch (error) {
    console.error('[S_FaKeybinds] getKeybinds failed', error)
    Notify.create({
      group: false,
      message: i18n.global.t('globalFunctionality.faKeybinds.loadError'),
      timeout: 0,
      type: 'negative'
    })
  }
}
