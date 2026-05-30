import type { T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'
import type { I_ref } from 'app/types/I_vueCompositionShims'

export function createGlobalLanguageSelectorSpellcheckRefresh (deps: {
  ref: <T>(value: T) => I_ref<T>
  runFaActionAwait: (id: 'refreshWebContentsAfterLanguage', payload: undefined) => Promise<boolean>
}): () => {
    noteLanguageApplied: (
      priorCode: T_faUserSettingsLanguageCode,
      nextCode: T_faUserSettingsLanguageCode
    ) => void
    refreshWebContentsAndHide: () => Promise<void>
    showSpellcheckRefresh: I_ref<boolean>
  } {
  return function useGlobalLanguageSelectorSpellcheckRefresh () {
    const showSpellcheckRefresh = deps.ref(false)

    function noteLanguageApplied (
      priorCode: T_faUserSettingsLanguageCode,
      nextCode: T_faUserSettingsLanguageCode
    ): void {
      if (nextCode !== priorCode) {
        showSpellcheckRefresh.value = true
      }
    }

    async function refreshWebContentsAndHide (): Promise<void> {
      await deps.runFaActionAwait('refreshWebContentsAfterLanguage', undefined)
      showSpellcheckRefresh.value = false
    }

    return {
      noteLanguageApplied,
      refreshWebContentsAndHide,
      showSpellcheckRefresh
    }
  }
}
