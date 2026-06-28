import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'

export function createUseProjectDocumentControlBar (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  S_FaUserSettings: () => StoreGeneric
  storeToRefs: T_piniaStoreToRefs
}): () => {
    showDocumentControlBar: I_computedRef<boolean>
  } {
  return function useProjectDocumentControlBar () {
    const { settings } = deps.storeToRefs(deps.S_FaUserSettings())!

    const showDocumentControlBar = deps.computed(() => {
      return settings!.value?.disableDocumentControlBar !== true
    })

    return {
      showDocumentControlBar
    }
  }
}
