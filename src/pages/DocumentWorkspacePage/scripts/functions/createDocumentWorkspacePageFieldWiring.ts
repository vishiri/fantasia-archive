import type {
  T_createUseDocumentWorkspacePageDeps
} from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function wireDocumentWorkspacePageColorPickers (input: {
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

export function wireDocumentWorkspacePageIsCategoryToggle (input: {
  deps: T_createUseDocumentWorkspacePageDeps
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  openedDocumentsStore: ReturnType<T_createUseDocumentWorkspacePageDeps['S_FaOpenedDocuments']>
  routeDocumentId: I_computedRef<string>
}) {
  return input.deps.createDocumentWorkspacePageIsCategoryToggle({
    computed: input.deps.computed,
    documentTab: input.documentTab,
    i18n: input.deps.i18n,
    resolveOpenedDocumentTabIsInPreviewMode: input.deps.resolveOpenedDocumentTabIsInPreviewMode,
    routeDocumentId: input.routeDocumentId,
    updateIsCategoryDraft: input.openedDocumentsStore.updateIsCategoryDraft.bind(
      input.openedDocumentsStore
    )
  })
}
