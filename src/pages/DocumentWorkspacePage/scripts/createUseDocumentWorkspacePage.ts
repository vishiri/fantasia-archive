import type {
  T_createUseDocumentWorkspacePageDeps,
  T_useDocumentWorkspacePageApi
} from 'app/types/I_documentWorkspacePage'

import { createDocumentWorkspacePageCoreModels } from './createDocumentWorkspacePageCoreModels'
import {
  wireDocumentWorkspacePageColorPickers,
  wireDocumentWorkspacePageIsCategoryToggle
} from './createDocumentWorkspacePageFieldWiring'
import { wireDocumentWorkspacePageBelongsUnderField } from './createDocumentWorkspacePageBelongsUnderFieldWiring'
import { wireDocumentWorkspacePageStatusFlagToggles } from './createDocumentWorkspacePageStatusFlagTogglesWiring'

function buildDocumentWorkspacePageApi (input: {
  belongsUnderField: ReturnType<typeof wireDocumentWorkspacePageBelongsUnderField>
  colorPickers: ReturnType<typeof wireDocumentWorkspacePageColorPickers>
  coreModels: ReturnType<typeof createDocumentWorkspacePageCoreModels>
  isCategoryToggle: ReturnType<typeof wireDocumentWorkspacePageIsCategoryToggle>
  statusFlagToggles: ReturnType<typeof wireDocumentWorkspacePageStatusFlagToggles>
}): ReturnType<T_useDocumentWorkspacePageApi> {
  const displayNameModel = input.coreModels.displayNameModel
  const documentShowsEditFields = input.coreModels.documentShowsEditFields
  const documentShowsPreview = input.coreModels.documentShowsPreview
  const documentTab = input.coreModels.documentTab
  const nameFieldLabel = input.coreModels.nameFieldLabel
  const previewDisplayName = input.coreModels.previewDisplayName

  return {
    ...input.belongsUnderField,
    ...input.colorPickers,
    ...input.isCategoryToggle,
    ...input.statusFlagToggles,
    displayNameModel,
    documentShowsEditFields,
    documentShowsPreview,
    documentTab,
    nameFieldLabel,
    previewDisplayName
  }
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

    const coreModels = createDocumentWorkspacePageCoreModels({
      createDocumentWorkspacePageRouteEffects: deps.createDocumentWorkspacePageRouteEffects,
      computed: deps.computed,
      findTabByDocumentId: openedDocumentsStore.findTabByDocumentId.bind(openedDocumentsStore),
      hydrationComplete: hydrationComplete!,
      i18n: deps.i18n,
      navigateToWorkspaceHomeRoute: deps.navigateToWorkspaceHomeRoute,
      onMounted: deps.onMounted,
      resolveOpenedDocumentDisplayNameFromTab: deps.resolveOpenedDocumentDisplayNameFromTab,
      resolveOpenedDocumentTabIsInEditMode: deps.resolveOpenedDocumentTabIsInEditMode,
      resolveOpenedDocumentTabIsInPreviewMode: deps.resolveOpenedDocumentTabIsInPreviewMode,
      routeParams: route.params,
      updateDisplayNameDraft: openedDocumentsStore.updateDisplayNameDraft.bind(openedDocumentsStore),
      watch: deps.watch
    })

    const colorPickers = wireDocumentWorkspacePageColorPickers({
      deps,
      documentTab: coreModels.documentTab,
      hierarchyTreeStore,
      openedDocumentsStore,
      routeDocumentId: coreModels.routeDocumentId,
      worlds: worlds!
    })

    const isCategoryToggle = wireDocumentWorkspacePageIsCategoryToggle({
      deps,
      documentTab: coreModels.documentTab,
      openedDocumentsStore,
      routeDocumentId: coreModels.routeDocumentId
    })

    const statusFlagToggles = wireDocumentWorkspacePageStatusFlagToggles({
      deps,
      documentTab: coreModels.documentTab,
      openedDocumentsStore,
      routeDocumentId: coreModels.routeDocumentId
    })

    const belongsUnderField = wireDocumentWorkspacePageBelongsUnderField({
      deps,
      documentTab: coreModels.documentTab,
      openedDocumentsStore,
      routeDocumentId: coreModels.routeDocumentId
    })

    return buildDocumentWorkspacePageApi({
      belongsUnderField,
      colorPickers,
      coreModels,
      isCategoryToggle,
      statusFlagToggles
    })
  }
}
