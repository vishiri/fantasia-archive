import { Notify } from 'quasar'
import { ResultAsync } from 'neverthrow'

import type { I_faKeybindsUpdatePatch } from 'app/types/I_faKeybindsBridgeUpdate'
import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Persists keybind overrides via the preload bridge, refreshes snapshot, and surfaces a success toast.
 * Save failures are reported through the central faActionManager (one toast + console row); this module only writes a debugging console log on the catch branch.
 */
export async function runFaKeybindsUpdateKeybinds (
  patch: I_faKeybindsUpdatePatch,
  refreshKeybinds: () => Promise<void>
): Promise<boolean> {
  const api = window.faContentBridgeAPIs?.faKeybinds
  if (typeof api?.setKeybinds !== 'function') {
    return false
  }

  const saveResult = await ResultAsync.fromPromise(
    api.setKeybinds(patch),
    (error): unknown => error
  )
  if (saveResult.isErr()) {
    const error = saveResult.error
    // Error toast handled by the action manager's unified failure reporter; only the bridge log stays here.
    console.error('[S_FaKeybinds] setKeybinds failed', error)
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
