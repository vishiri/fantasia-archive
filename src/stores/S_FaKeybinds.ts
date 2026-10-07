import type { Ref } from 'vue'

import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

import type { I_faKeybindsRoot, I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsUpdatePatch } from 'app/types/I_faKeybindsBridgeUpdate'

import { runFaKeybindsRefreshKeybinds } from './scripts/sFaKeybindsBridgeRefresh'
import { runFaKeybindsUpdateKeybinds } from './scripts/sFaKeybindsBridgeUpdate'

export const S_FaKeybinds = defineStore('S_FaKeybinds', () => {
  const snapshot: Ref<I_faKeybindsSnapshot | null> = ref(null)
  const suspendGlobalKeybindDispatch = ref(false)
  let keybindsIoTail: Promise<void> = Promise.resolve()

  function enqueueKeybindsIo<T> (work: () => Promise<T>): Promise<T> {
    const run = keybindsIoTail.then(work)
    keybindsIoTail = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  function setSuspendGlobalKeybindDispatch (value: boolean): void {
    suspendGlobalKeybindDispatch.value = value
  }

  async function loadKeybindsFromBridge (): Promise<void> {
    await runFaKeybindsRefreshKeybinds(snapshot)
  }

  async function refreshKeybinds (): Promise<void> {
    await enqueueKeybindsIo(loadKeybindsFromBridge)
  }

  function applySavedKeybindOverrides (overrides: I_faKeybindsRoot['overrides']): boolean {
    const current = snapshot.value
    if (current === null) {
      return false
    }
    const savedOverrides = JSON.parse(JSON.stringify(overrides)) as I_faKeybindsRoot['overrides']
    snapshot.value = {
      platform: current.platform,
      store: {
        overrides: savedOverrides,
        schemaVersion: 1
      }
    }
    return true
  }

  async function updateKeybinds (patch: I_faKeybindsUpdatePatch): Promise<boolean> {
    return await enqueueKeybindsIo(async () => {
      return await runFaKeybindsUpdateKeybinds(
        patch,
        loadKeybindsFromBridge,
        applySavedKeybindOverrides
      )
    })
  }

  const publishedSnapshot = readonly(snapshot)
  const publishedSuspendGlobalKeybindDispatch = readonly(suspendGlobalKeybindDispatch)
  return {
    refreshKeybinds,
    setSuspendGlobalKeybindDispatch,
    snapshot: publishedSnapshot,
    suspendGlobalKeybindDispatch: publishedSuspendGlobalKeybindDispatch,
    updateKeybinds
  }
})
