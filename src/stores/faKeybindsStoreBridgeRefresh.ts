import type { Ref } from 'vue'

import { Notify } from 'quasar'
import { ResultAsync } from 'neverthrow'

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
  const loadResult = await ResultAsync.fromPromise(
    api.getKeybinds(),
    (error): unknown => error
  )
  if (loadResult.isOk()) {
    snapshot.value = loadResult.value
    return
  }
  const error = loadResult.error
  console.error('[S_FaKeybinds] getKeybinds failed', error)
  Notify.create({
    group: false,
    message: i18n.global.t('globalFunctionality.faKeybinds.loadError'),
    timeout: 0,
    type: 'negative'
  })
}
