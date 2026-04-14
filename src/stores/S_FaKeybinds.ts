import type { Ref } from 'vue'

import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { ref } from 'vue'

import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'
import { i18n } from 'app/i18n/externalFileLoader'

export const S_FaKeybinds = defineStore('S_FaKeybinds', () => {
  const snapshot: Ref<I_faKeybindsSnapshot | null> = ref(null)
  const suspendGlobalKeybindDispatch = ref(false)

  function setSuspendGlobalKeybindDispatch (value: boolean): void {
    suspendGlobalKeybindDispatch.value = value
  }

  async function refreshKeybinds (): Promise<void> {
    const api = window.faContentBridgeAPIs?.faKeybinds
    if (typeof api?.getKeybinds !== 'function') {
      return
    }
    snapshot.value = await api.getKeybinds()
  }

  async function updateKeybinds (patch: {
    overrides?: I_faKeybindsRoot['overrides']
    replaceAllOverrides?: boolean
  }): Promise<boolean> {
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

  return {
    refreshKeybinds,
    setSuspendGlobalKeybindDispatch,
    snapshot,
    suspendGlobalKeybindDispatch,
    updateKeybinds
  }
})
