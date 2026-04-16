import type { Ref } from 'vue'

import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'

import { runFaKeybindsRefreshKeybinds } from './faKeybindsStoreBridgeRefresh'
import {
  runFaKeybindsUpdateKeybinds,
  type I_faKeybindsUpdatePatch
} from './faKeybindsStoreBridgeUpdate'

export const S_FaKeybinds = defineStore('S_FaKeybinds', () => {
  const snapshot: Ref<I_faKeybindsSnapshot | null> = ref(null)
  const suspendGlobalKeybindDispatch = ref(false)

  function setSuspendGlobalKeybindDispatch (value: boolean): void {
    suspendGlobalKeybindDispatch.value = value
  }

  async function refreshKeybinds (): Promise<void> {
    await runFaKeybindsRefreshKeybinds(snapshot)
  }

  async function updateKeybinds (patch: I_faKeybindsUpdatePatch): Promise<boolean> {
    return await runFaKeybindsUpdateKeybinds(patch, refreshKeybinds)
  }

  return {
    refreshKeybinds,
    setSuspendGlobalKeybindDispatch,
    snapshot,
    suspendGlobalKeybindDispatch,
    updateKeybinds
  }
})
