import { ref } from 'vue'

import type { I_ref } from 'app/types/I_vueCompositionShims'

export const faAppHeaderChromeSpellcheckRefreshVisible = ref(false)

export function syncFaAppHeaderChromeSpellcheckRefreshVisible (visible: boolean): void {
  faAppHeaderChromeSpellcheckRefreshVisible.value = visible
}

export function useFaAppHeaderChromeSpellcheckRefreshVisible (): I_ref<boolean> {
  return faAppHeaderChromeSpellcheckRefreshVisible
}
