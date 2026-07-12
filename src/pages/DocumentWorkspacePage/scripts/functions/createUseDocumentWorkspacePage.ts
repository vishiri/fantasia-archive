import type {
  T_createUseDocumentWorkspacePageDeps,
  T_useDocumentWorkspacePageApi
} from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

function wireDocumentWorkspacePageColorPickers (input: {
  deps: T_createUseDocumentWorkspacePageDeps
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  hierarchyTreeStore: ReturnType<T_createUseDocumentWorkspacePageDeps['S_FaProjectHierarchyTree']>
  openedDocumentsStore: ReturnType<T_createUseDocumentWorkspacePageDeps['S_FaOpenedDocuments']>
  routeDocumentId: I_computedRef<string>
  worlds: I_computedRef<readonly I_faProjectHierarchyTreeWorkspaceWorld[]>
}) {
  return input.deps.createDocumentWorkspacePageColorPickers({
    computed: input.deps.computed,
    documentTab: input.documentTab,
    i18n: input.deps.i18n,
    parseFaProjectWorldColorPalleteToHexList: input.deps.parseFaProjectWorldColorPalleteToHexList,
    patchWorldColorPalleteInLayout: input.hierarchyTreeStore.patchWorldColorPalleteInLayout.bind(
      input.hierarchyTreeStore
    ),
    resolveOpenedDocumentTabIsInPreviewMode: input.deps.resolveOpenedDocumentTabIsInPreviewMode,
    routeDocumentId: input.routeDocumentId,
    updateDocumentBackgroundColorDraft: input.openedDocumentsStore.updateDocumentBackgroundColorDraft.bind(
      input.openedDocumentsStore
    ),
    updateDocumentTextColorDraft: input.openedDocumentsStore.updateDocumentTextColorDraft.bind(
      input.openedDocumentsStore
    ),
    worlds: input.worlds
  })
}

export function createUseDocumentWorkspacePage (
  deps: T_createUseDocumentWorkspacePageDeps
): T_useDocumentWorkspacePageApi {
  return function useDocumentWorkspacePage () {
    const route = deps.useRoute()
    const openedDocumentsStore = deps.S_FaOpenedDocuments()
    const hierarchyTreeStore = deps.S_FaProjectHierarchyTree()
    const { hydrationComplete } = deps.storeToRefs(openedDocumentsStore)!
    const { worlds } = deps.storeToRefs(hierarchyTreeStore)!

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

    const colorPickers = wireDocumentWorkspacePageColorPickers({
      deps,
      documentTab,
      hierarchyTreeStore,
      openedDocumentsStore,
      routeDocumentId,
      worlds: worlds!
    })

    const backgroundColorFieldLabel = colorPickers.backgroundColorFieldLabel
    const backgroundColorModel = colorPickers.backgroundColorModel
    const documentColorPickersReadOnly = colorPickers.documentColorPickersReadOnly
    const onAppendToWorldPalette = colorPickers.onAppendToWorldPalette
    const textColorFieldLabel = colorPickers.textColorFieldLabel
    const textColorModel = colorPickers.textColorModel
    const worldColorPaletteAppend = colorPickers.worldColorPaletteAppend
    const worldPickerPalette = colorPickers.worldPickerPalette

    return {
      backgroundColorFieldLabel,
      backgroundColorModel,
      displayNameModel,
      documentColorPickersReadOnly,
      documentShowsEditFields,
      documentShowsPreview,
      documentTab,
      nameFieldLabel,
      onAppendToWorldPalette,
      previewDisplayName,
      textColorFieldLabel,
      textColorModel,
      worldColorPaletteAppend,
      worldPickerPalette
    }
  }
}
