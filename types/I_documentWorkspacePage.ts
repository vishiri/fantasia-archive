import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

/** Injected deps for DocumentWorkspacePage composable factory. */
export type T_createUseDocumentWorkspacePageDeps = {
  S_FaOpenedDocuments: () => StoreGeneric & {
    findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
    updateDisplayNameDraft: (documentId: string, value: string) => void
  }
  computed: {
    <T>(getter: () => T): I_computedRef<T>
    <T>(options: {
      get: () => T
      set: (value: T) => void
    }): I_computedRef<T>
  }
  createDocumentWorkspacePageRouteEffects: (input: {
    computed: {
      <T>(getter: () => T): I_computedRef<T>
    }
    findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
    hydrationComplete: { value: boolean }
    navigateToWorkspaceHomeRoute: () => Promise<void>
    onMounted: (hook: () => void) => void
    routeParams: {
      documentId?: string | string[]
    }
    watch: (
      source: () => string | boolean,
      effect: () => void,
      options?: { immediate?: boolean }
    ) => void
  }) => {
    routeDocumentId: I_computedRef<string>
  }
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  navigateToWorkspaceHomeRoute: () => Promise<void>
  onMounted: (hook: () => void) => void
  resolveOpenedDocumentDisplayNameFromTab: (
    tab: Pick<I_faOpenedDocumentTab, 'displayNameDraft' | 'tabLabel'>
  ) => string
  resolveOpenedDocumentTabIsInEditMode: (editState: boolean) => boolean
  resolveOpenedDocumentTabIsInPreviewMode: (editState: boolean) => boolean
  storeToRefs: T_piniaStoreToRefs
  useRoute: () => {
    params: {
      documentId?: string | string[]
    }
  }
  watch: (
    source: () => string | boolean,
    effect: () => void,
    options?: { immediate?: boolean }
  ) => void
}

/** DocumentWorkspacePage composable API. */
export type T_useDocumentWorkspacePageApi = () => {
  displayNameModel: I_computedRef<string>
  documentShowsEditFields: I_computedRef<boolean>
  documentShowsPreview: I_computedRef<boolean>
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  nameFieldLabel: I_computedRef<string>
  previewDisplayName: I_computedRef<string>
}
