import { ref } from 'vue'

import type { T_faUserSettingsLanguageCode } from 'app/types/T_faUserSettingsLanguageCode'

/**
 * Optional reload hint after a successful interface language change so users can refresh
 * the renderer when Chromium keeps the previous spellcheck dictionary in open editors.
 */
export function useGlobalLanguageSelectorSpellcheckRefresh () {
  const showSpellcheckRefresh = ref(false)

  function noteLanguageApplied (
    priorCode: T_faUserSettingsLanguageCode,
    nextCode: T_faUserSettingsLanguageCode
  ): void {
    if (nextCode !== priorCode) {
      showSpellcheckRefresh.value = true
    }
  }

  async function refreshWebContentsAndHide (): Promise<void> {
    // TODO add unfinished work checking
    try {
      await window.faContentBridgeAPIs?.faWindowControl?.refreshWebContents?.()
    } catch {
      // no-op
    }
    showSpellcheckRefresh.value = false
  }

  return {
    noteLanguageApplied,
    refreshWebContentsAndHide,
    showSpellcheckRefresh
  }
}
