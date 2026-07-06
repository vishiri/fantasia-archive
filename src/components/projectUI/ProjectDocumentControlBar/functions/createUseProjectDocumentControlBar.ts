import type {
  I_projectDocumentControlBarComposableApi,
  T_assembleProjectDocumentControlBarApiFn
} from 'app/types/I_faProjectDocumentControlBarDomain'
import type { T_projectDocumentControlBarSaveButtonColor } from 'app/types/T_projectDocumentControlBarSaveButtonColor'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'

export function createUseProjectDocumentControlBar (deps: {
  assembleProjectDocumentControlBarApi: T_assembleProjectDocumentControlBarApiFn
  computed: <T>(getter: () => T) => I_computedRef<T>
  resolveActiveDocumentTabName: (input: {
    activeDocumentId: string | null
    openedTabs: readonly { documentId: string }[]
  }) => string | undefined
  resolveDocumentTabLabelFromOpenedTab: (input: {
    displayNameDraft: string
    tabLabel: string
  }) => string
  resolveFaDocumentWorkspaceRouteDocumentId: (routePath: string) => string | null
  resolveShowDocumentControlBarStrip: (input: {
    disableDocumentControlBar: boolean
  }) => boolean
  resolveShowDocumentTabs: (openedTabCount: number) => boolean
  resolveShowProjectDocumentControlBarEditButton: (input: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveShowProjectDocumentControlBarSaveButtons: (input: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveProjectDocumentControlBarSaveButtonColor: (input: {
    hasUnsavedChanges: boolean
  }) => T_projectDocumentControlBarSaveButtonColor
  S_FaOpenedDocuments: () => StoreGeneric & {
    enterDocumentEditMode: (documentId: string) => void
    requestCloseTab: (documentId: string) => void
    saveDocumentDisplayName: (
      documentId: string,
      input: { keepEditMode: boolean }
    ) => Promise<boolean>
  }
  S_FaUserSettings: () => StoreGeneric
  storeToRefs: T_piniaStoreToRefs
  useRoute: () => {
    path: string
  }
}): () => I_projectDocumentControlBarComposableApi {
  return function useProjectDocumentControlBar () {
    const route = deps.useRoute()
    const { settings } = deps.storeToRefs(deps.S_FaUserSettings())!
    const { activeDocumentId, tabs } = deps.storeToRefs(deps.S_FaOpenedDocuments())!
    const openedDocumentsStore = deps.S_FaOpenedDocuments()

    const isDocumentControlBarDisabled = deps.computed(() => {
      return settings!.value?.disableDocumentControlBar === true
    })

    const isOnDocumentWorkspaceRoute = deps.computed(() => {
      return deps.resolveFaDocumentWorkspaceRouteDocumentId(route.path) !== null
    })

    return deps.assembleProjectDocumentControlBarApi({
      activeDocumentId: activeDocumentId!,
      computed: deps.computed,
      enterDocumentEditMode: (documentId: string) => {
        openedDocumentsStore.enterDocumentEditMode(documentId)
      },
      isDocumentControlBarDisabled,
      isOnDocumentWorkspaceRoute,
      requestCloseTab: (documentId: string) => {
        openedDocumentsStore.requestCloseTab(documentId)
      },
      resolveActiveDocumentTabName: deps.resolveActiveDocumentTabName,
      resolveDocumentTabLabelFromOpenedTab: deps.resolveDocumentTabLabelFromOpenedTab,
      resolveShowDocumentControlBarStrip: deps.resolveShowDocumentControlBarStrip,
      resolveShowDocumentTabs: deps.resolveShowDocumentTabs,
      resolveShowProjectDocumentControlBarEditButton: deps.resolveShowProjectDocumentControlBarEditButton,
      resolveShowProjectDocumentControlBarSaveButtons: deps.resolveShowProjectDocumentControlBarSaveButtons,
      resolveProjectDocumentControlBarSaveButtonColor: deps.resolveProjectDocumentControlBarSaveButtonColor,
      saveDocumentDisplayName: (documentId, input) => {
        return openedDocumentsStore.saveDocumentDisplayName(documentId, input)
      },
      tabs: tabs!
    })
  }
}
