import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { I_faProjectWorkspaceWorldListItem } from 'app/types/I_faProjectWorkspaceWorldsDomain'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'

export function createUseProjectWorkspaceWorldList (deps: {
  S_FaProjectWorkspaceWorlds: () => StoreGeneric
  storeToRefs: T_piniaStoreToRefs
}): () => {
    worldListItems: I_ref<readonly I_faProjectWorkspaceWorldListItem[]>
  } {
  return function useProjectWorkspaceWorldList () {
    const { worldListItems } = deps.storeToRefs(deps.S_FaProjectWorkspaceWorlds())!

    return {
      worldListItems: worldListItems!
    }
  }
}
