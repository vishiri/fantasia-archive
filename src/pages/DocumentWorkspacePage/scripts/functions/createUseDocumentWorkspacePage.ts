import type {
  T_createUseDocumentWorkspacePageDeps,
  T_useDocumentWorkspacePageApi
} from 'app/types/I_documentWorkspacePage'

export function createUseDocumentWorkspacePage (
  deps: T_createUseDocumentWorkspacePageDeps
): T_useDocumentWorkspacePageApi {
  return function useDocumentWorkspacePage () {
    const route = deps.useRoute()
    const openedDocumentsStore = deps.S_FaOpenedDocuments()
    const { hydrationComplete } = deps.storeToRefs(openedDocumentsStore)!

    const { routeDocumentId } = deps.createDocumentWorkspacePageRouteEffects({
      computed: deps.computed,
      findTabByDocumentId: openedDocumentsStore.findTabByDocumentId.bind(openedDocumentsStore),
      hydrationComplete: hydrationComplete!,
      navigateToWorkspaceHomeRoute: deps.navigateToWorkspaceHomeRoute,
      onMounted: deps.onMounted,
      routeParams: route.params,
      watch: deps.watch
    })

    const documentTab = deps.computed(() => {
      if (routeDocumentId.value.length === 0) {
        return null
      }
      return openedDocumentsStore.findTabByDocumentId(routeDocumentId.value)
    })

    const nameFieldLabel = deps.computed(() => {
      return deps.i18n.global.t('documentWorkspacePage.nameFieldLabel')
    })

    const displayNameModel = deps.computed({
      get () {
        return documentTab.value?.displayNameDraft ?? ''
      },
      set (value: string) {
        if (routeDocumentId.value.length === 0) {
          return
        }
        openedDocumentsStore.updateDisplayNameDraft(routeDocumentId.value, value)
      }
    })

    const documentShowsPreview = deps.computed(() => {
      const tab = documentTab.value
      if (tab === null) {
        return false
      }
      return deps.resolveOpenedDocumentTabIsInPreviewMode(tab.editState)
    })

    const documentShowsEditFields = deps.computed(() => {
      const tab = documentTab.value
      if (tab === null) {
        return false
      }
      return deps.resolveOpenedDocumentTabIsInEditMode(tab.editState)
    })

    const previewDisplayName = deps.computed(() => {
      const tab = documentTab.value
      if (tab === null) {
        return ''
      }
      return deps.resolveOpenedDocumentDisplayNameFromTab(tab)
    })

    return {
      displayNameModel,
      documentShowsEditFields,
      documentShowsPreview,
      documentTab,
      nameFieldLabel,
      previewDisplayName
    }
  }
}
