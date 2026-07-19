import type { T_createUseDocumentWorkspacePageDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function createDocumentWorkspacePageIsCategoryToggle (deps: {
  computed: T_createUseDocumentWorkspacePageDeps['computed']
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  i18n: T_createUseDocumentWorkspacePageDeps['i18n']
  resolveOpenedDocumentTabIsInPreviewMode: T_createUseDocumentWorkspacePageDeps['resolveOpenedDocumentTabIsInPreviewMode']
  routeDocumentId: I_computedRef<string>
  updateIsCategoryDraft: (documentId: string, value: boolean) => void
}): {
    isCategoryDescription: I_computedRef<string>
    isCategoryModel: I_computedRef<boolean>
    isCategoryTitle: I_computedRef<string>
    isCategoryToggleReadOnly: I_computedRef<boolean>
  } {
  const isCategoryTitle = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.isCategoryTitle')
  })

  const isCategoryDescription = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.isCategoryDescription')
  })

  const isCategoryToggleReadOnly = deps.computed(() => {
    const tab = deps.documentTab.value
    if (tab === null) {
      return true
    }
    return deps.resolveOpenedDocumentTabIsInPreviewMode(tab.editState)
  })

  const isCategoryModel = deps.computed({
    get () {
      return deps.documentTab.value?.isCategoryDraft ?? false
    },
    set (value: boolean) {
      if (deps.routeDocumentId.value.length === 0 || isCategoryToggleReadOnly.value) {
        return
      }
      deps.updateIsCategoryDraft(deps.routeDocumentId.value, value)
    }
  })

  return {
    isCategoryDescription,
    isCategoryModel,
    isCategoryTitle,
    isCategoryToggleReadOnly
  }
}
