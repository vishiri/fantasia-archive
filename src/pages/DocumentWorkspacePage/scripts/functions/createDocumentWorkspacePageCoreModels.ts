import type { T_createUseDocumentWorkspacePageDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function createDocumentWorkspacePageCoreModels (deps: {
  createDocumentWorkspacePageRouteEffects: T_createUseDocumentWorkspacePageDeps['createDocumentWorkspacePageRouteEffects']
  computed: T_createUseDocumentWorkspacePageDeps['computed']
  findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
  hydrationComplete: { value: boolean }
  i18n: T_createUseDocumentWorkspacePageDeps['i18n']
  navigateToWorkspaceHomeRoute: T_createUseDocumentWorkspacePageDeps['navigateToWorkspaceHomeRoute']
  onMounted: T_createUseDocumentWorkspacePageDeps['onMounted']
  resolveOpenedDocumentDisplayNameFromTab: T_createUseDocumentWorkspacePageDeps['resolveOpenedDocumentDisplayNameFromTab']
  resolveOpenedDocumentTabIsInEditMode: T_createUseDocumentWorkspacePageDeps['resolveOpenedDocumentTabIsInEditMode']
  resolveOpenedDocumentTabIsInPreviewMode: T_createUseDocumentWorkspacePageDeps['resolveOpenedDocumentTabIsInPreviewMode']
  routeParams: {
    documentId?: string | string[]
  }
  updateDisplayNameDraft: (documentId: string, value: string) => void
  watch: T_createUseDocumentWorkspacePageDeps['watch']
}): {
    displayNameModel: I_computedRef<string>
    documentShowsEditFields: I_computedRef<boolean>
    documentShowsPreview: I_computedRef<boolean>
    documentTab: I_computedRef<I_faOpenedDocumentTab | null>
    nameFieldLabel: I_computedRef<string>
    previewDisplayName: I_computedRef<string>
    routeDocumentId: I_computedRef<string>
  } {
  const { routeDocumentId } = deps.createDocumentWorkspacePageRouteEffects({
    computed: deps.computed,
    findTabByDocumentId: deps.findTabByDocumentId,
    hydrationComplete: deps.hydrationComplete,
    navigateToWorkspaceHomeRoute: deps.navigateToWorkspaceHomeRoute,
    onMounted: deps.onMounted,
    routeParams: deps.routeParams,
    watch: deps.watch
  })

  const documentTab = deps.computed(() => {
    if (routeDocumentId.value.length === 0) {
      return null
    }
    return deps.findTabByDocumentId(routeDocumentId.value)
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
      deps.updateDisplayNameDraft(routeDocumentId.value, value)
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
    previewDisplayName,
    routeDocumentId
  }
}
