import type {
  I_projectDocumentControlBarComposableApi
} from 'app/types/I_faProjectDocumentControlBarDomain'
import type { I_faCreateUseProjectDocumentControlBarDeps } from 'app/types/I_faCreateUseProjectDocumentControlBarDeps'

export function createUseProjectDocumentControlBar (
  deps: I_faCreateUseProjectDocumentControlBarDeps
): () => I_projectDocumentControlBarComposableApi {
  return function useProjectDocumentControlBar () {
    const route = deps.useRoute()
    const { t } = deps.useI18n()
    const { settings } = deps.storeToRefs(deps.S_FaUserSettings())!
    const { activeDocumentId, tabs } = deps.storeToRefs(deps.S_FaOpenedDocuments())!
    const openedDocumentsStore = deps.S_FaOpenedDocuments()

    const isDocumentControlBarDisabled = deps.computed(() => {
      return settings!.value?.disableDocumentControlBar === true
    })

    const isOnDocumentWorkspaceRoute = deps.computed(() => {
      return deps.resolveFaDocumentWorkspaceRouteDocumentId(route.path) !== null
    })

    return deps.assembleProjectDocumentControlBarApi(
      deps.buildProjectDocumentControlBarAssembleInput({
        activeDocumentId: activeDocumentId!,
        computed: deps.computed,
        copyToClipboard: deps.copyToClipboard,
        enterDocumentEditMode: (documentId: string) => {
          openedDocumentsStore.enterDocumentEditMode(documentId)
        },
        findTabByDocumentId: (documentId: string) => {
          return openedDocumentsStore.findTabByDocumentId(documentId)
        },
        formatFaKeybindCommandLabelFromSnapshot: deps.formatFaKeybindCommandLabelFromSnapshot,
        getKeybindsSnapshot: deps.getKeybindsSnapshot,
        isDocumentControlBarDisabled,
        isOnDocumentWorkspaceRoute,
        moveDocumentTab: (documentId: string, direction: 'left' | 'right') => {
          openedDocumentsStore.moveDocumentTab(documentId, direction)
        },
        notifyCreate: deps.notifyCreate,
        closeAllTabsWithoutChanges: () => {
          void openedDocumentsStore.closeAllTabsWithoutChanges()
        },
        closeTabsWithoutChangesExcept: (exceptDocumentId: string) => {
          void openedDocumentsStore.closeTabsWithoutChangesExcept(exceptDocumentId)
        },
        requestDeleteDocument: (documentId: string) => {
          openedDocumentsStore.requestDeleteDocument(documentId)
        },
        forceCloseAllTabs: () => {
          void openedDocumentsStore.forceCloseAllTabs()
        },
        forceCloseAllTabsExcept: (exceptDocumentId: string) => {
          void openedDocumentsStore.forceCloseAllTabsExcept(exceptDocumentId)
        },
        requestCloseTab: (documentId: string) => {
          openedDocumentsStore.requestCloseTab(documentId)
        },
        resolveActiveDocumentTabName: deps.resolveActiveDocumentTabName,
        resolveDocumentTabLabelFromOpenedTab: deps.resolveDocumentTabLabelFromOpenedTab,
        resolveShowDocumentControlBarStrip: deps.resolveShowDocumentControlBarStrip,
        resolveShowDocumentTabs: deps.resolveShowDocumentTabs,
        resolveShowProjectDocumentControlBarEditButton: deps.resolveShowProjectDocumentControlBarEditButton,
        resolveShowProjectDocumentControlBarDeleteButton: deps.resolveShowProjectDocumentControlBarDeleteButton,
        resolveShowProjectDocumentControlBarSaveButtons: deps.resolveShowProjectDocumentControlBarSaveButtons,
        resolveProjectDocumentControlBarSaveButtonColor: deps.resolveProjectDocumentControlBarSaveButtonColor,
        runFaAction: deps.runFaAction,
        tabs: tabs!,
        translateCopyNameFailed: () => {
          return t('projectUI.projectDocumentControlBar.copyNameFailed')
        },
        translateCopyNameSuccess: () => {
          return t('projectUI.projectDocumentControlBar.copyNameSuccess')
        }
      })
    )
  }
}
