import { Notify } from 'quasar'
import { ResultAsync } from 'neverthrow'

import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsUpdatePatch } from 'app/types/I_faKeybindsBridgeUpdate'
import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Persists keybind overrides via the preload bridge, refreshes snapshot, and surfaces a success toast.
 * Save failures are reported through the central faActionManager (one toast + console row); this module only writes a debugging console log on the catch branch.
 */
async function refreshFaKeybindsAfterSave (
  patch: I_faKeybindsUpdatePatch,
  refreshKeybinds: () => Promise<void>,
  applySavedOverrides: ((overrides: I_faKeybindsRoot['overrides']) => boolean) | undefined
): Promise<boolean> {
  try {
    await refreshKeybinds()
    return true
  } catch (error: unknown) {
    console.error('[S_FaKeybinds] refresh after setKeybinds failed', error)
    if (patch.replaceAllOverrides !== true || patch.overrides === undefined) {
      return false
    }
    if (applySavedOverrides === undefined) {
      return false
    }
    return applySavedOverrides(patch.overrides)
  }
}

export async function runFaKeybindsUpdateKeybinds (
  patch: I_faKeybindsUpdatePatch,
  refreshKeybinds: () => Promise<void>,
  applySavedOverrides?: (overrides: I_faKeybindsRoot['overrides']) => boolean
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

  const refreshed = await refreshFaKeybindsAfterSave(patch, refreshKeybinds, applySavedOverrides)
  if (!refreshed) {
    return false
  }

  Notify.create({
    group: false,
    message: i18n.global.t('globalFunctionality.faKeybinds.saveSuccess'),
    type: 'positive'
  })
  return true
}
