import type {
  I_projectAppControlBarComposableApi
} from 'app/types/I_faProjectAppControlBarDomain'
import type { I_faCreateUseProjectAppControlBarDeps } from 'app/types/I_faCreateUseProjectAppControlBarDeps'

export function createUseProjectAppControlBar (
  deps: I_faCreateUseProjectAppControlBarDeps
): () => I_projectAppControlBarComposableApi {
  return function useProjectAppControlBar () {
    const route = deps.useRoute()
    const { settings, appSettingsDialogPreview } = deps.storeToRefs(deps.S_FaUserSettings())!
    const { activeDocumentId, tabs } = deps.storeToRefs(deps.S_FaOpenedDocuments())!
    const { worlds: projectWorlds } = deps.storeToRefs(deps.S_FaProjectHierarchyTree())!
    const openedDocumentsStore = deps.S_FaOpenedDocuments()

    const isAppControlBarDisabled = deps.computed(() => {
      return settings!.value?.disableAppControlBar === true
    })

    const isAppControlBarGuidesDisabled = deps.computed(() => {
      return settings!.value?.disableAppControlBarGuides === true
    })

    const isAppControlBarFunctionButtonsDisabled = deps.computed(() => {
      return settings!.value?.disableAppControlBarFunctionButtons === true
    })

    const isAppControlBarContentButtonsDisabled = deps.computed(() => {
      return settings!.value?.disableAppControlBarContentButtons === true
    })

    const hideHierarchyTree = deps.computed(() => {
      return deps.resolveHideHierarchyTree(
        settings!.value,
        appSettingsDialogPreview!.value
      )
    })

    const isOnDocumentWorkspaceRoute = deps.computed(() => {
      return deps.resolveFaDocumentWorkspaceRouteDocumentId(route.path) !== null
    })

    return deps.assembleProjectAppControlBarApi(
      deps.buildProjectAppControlBarAssembleInput({
        activeDocumentId: activeDocumentId!,
        computed: deps.computed,
        enterDocumentEditMode: (documentId: string) => {
          openedDocumentsStore.enterDocumentEditMode(documentId)
        },
        findTabByDocumentId: (documentId: string) => {
          return openedDocumentsStore.findTabByDocumentId(documentId)
        },
        formatFaKeybindCommandLabelFromSnapshot: deps.formatFaKeybindCommandLabelFromSnapshot,
        getKeybindsSnapshot: deps.getKeybindsSnapshot,
        isAppControlBarDisabled,
        isAppControlBarGuidesDisabled,
        isAppControlBarFunctionButtonsDisabled,
        isAppControlBarContentButtonsDisabled,
        hideHierarchyTree,
        isOnDocumentWorkspaceRoute,
        moveDocumentTab: (documentId: string, direction: 'left' | 'right') => {
          openedDocumentsStore.moveDocumentTab(documentId, direction)
        },
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
        resolveShowAppControlBarStrip: deps.resolveShowAppControlBarStrip,
        resolveShowDocumentTabs: deps.resolveShowDocumentTabs,
        resolveShowProjectAppControlBarEditButton: deps.resolveShowProjectAppControlBarEditButton,
        resolveShowProjectAppControlBarDeleteButton: deps.resolveShowProjectAppControlBarDeleteButton,
        resolveShowProjectAppControlBarSaveButtons: deps.resolveShowProjectAppControlBarSaveButtons,
        resolveProjectAppControlBarSaveButtonColor: deps.resolveProjectAppControlBarSaveButtonColor,
        projectWorlds: projectWorlds!,
        runFaAction: deps.runFaAction,
        tabs: tabs!
      })
    )
  }
}
