import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

export function createDocumentWorkspacePageRouteEffects (deps: {
  computed: {
    <T>(getter: () => T): I_computedRef<T>
  }
  navigateToWorkspaceHomeRoute: () => Promise<void>
  routeParams: {
    documentId?: string | string[]
  }
  watch: (
    source: () => string | boolean,
    effect: () => void,
    options?: { immediate?: boolean }
  ) => void
  findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
  hydrationComplete: { value: boolean }
  onMounted: (hook: () => void) => void
}): {
    routeDocumentId: I_computedRef<string>
  } {
  const routeDocumentId = deps.computed(() => {
    const raw = deps.routeParams.documentId
    return typeof raw === 'string' ? raw : ''
  })

  async function ensureTabExistsOrRedirect (): Promise<void> {
    if (!deps.hydrationComplete.value) {
      return
    }
    if (routeDocumentId.value.length === 0) {
      await deps.navigateToWorkspaceHomeRoute()
      return
    }
    if (deps.findTabByDocumentId(routeDocumentId.value) === null) {
      await deps.navigateToWorkspaceHomeRoute()
    }
  }

  deps.watch(
    () => routeDocumentId.value,
    () => {
      void ensureTabExistsOrRedirect()
    },
    { immediate: true }
  )

  deps.watch(() => deps.hydrationComplete.value, () => {
    void ensureTabExistsOrRedirect()
  })

  deps.onMounted(() => {
    void ensureTabExistsOrRedirect()
  })

  return {
    routeDocumentId
  }
}
