import type { Ref } from 'vue'

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Notify } from 'quasar'

import type {
  I_faProgramStylingPatch,
  I_faProgramStylingRoot
} from 'app/types/I_faProgramStylingDomain'
import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Manages persisted user CSS sourced from the Electron main process via the IPC bridge.
 * Loads once on app start; saves go through 'updateProgramStyling' which mirrors the new value back into the reactive 'css' ref so any listener (for example FaUserCssInjector) can react.
 */
export const S_FaProgramStyling = defineStore('S_FaProgramStyling', () => {
  const root: Ref<I_faProgramStylingRoot | null> = ref(null)
  const css: Ref<string> = ref('')

  function setRoot (next: I_faProgramStylingRoot): void {
    root.value = next
    css.value = next.css
  }

  async function refreshProgramStyling (): Promise<void> {
    const api = window.faContentBridgeAPIs?.faProgramStyling
    if (typeof api?.getProgramStyling !== 'function') {
      return
    }
    try {
      const next = await api.getProgramStyling()
      setRoot(next)
    } catch (error) {
      console.error('[S_FaProgramStyling] getProgramStyling failed', error)
      Notify.create({
        group: false,
        message: i18n.global.t('globalFunctionality.faProgramStyling.loadError'),
        timeout: 0,
        type: 'negative'
      })
    }
  }

  async function updateProgramStyling (patch: I_faProgramStylingPatch): Promise<boolean> {
    const api = window.faContentBridgeAPIs?.faProgramStyling
    if (typeof api?.setProgramStyling !== 'function') {
      return false
    }

    try {
      await api.setProgramStyling(patch)
    } catch (error) {
      // Error toast handled by the action manager's unified failure reporter; only the bridge log stays here.
      console.error('[S_FaProgramStyling] setProgramStyling failed', error)
      throw error instanceof Error ? error : new Error(String(error))
    }

    let retrieved: I_faProgramStylingRoot
    try {
      retrieved = await api.getProgramStyling()
    } catch (error) {
      console.error('[S_FaProgramStyling] getProgramStyling after save failed', error)
      throw error instanceof Error ? error : new Error(String(error))
    }
    setRoot(retrieved)

    if (retrieved.css !== patch.css) {
      console.error(`[S_FaProgramStyling] ${i18n.global.t('globalFunctionality.faProgramStyling.saveMismatchLog')}`, {
        patch,
        retrieved
      })
      throw new Error(i18n.global.t('globalFunctionality.faProgramStyling.saveError'))
    }

    Notify.create({
      group: false,
      message: i18n.global.t('globalFunctionality.faProgramStyling.saveSuccess'),
      type: 'positive'
    })
    return true
  }

  return {
    css,
    refreshProgramStyling,
    root,
    updateProgramStyling
  }
})
