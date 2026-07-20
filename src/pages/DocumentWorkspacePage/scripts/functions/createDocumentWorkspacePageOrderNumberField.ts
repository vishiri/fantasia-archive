import type { T_createUseDocumentWorkspacePageDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function createDocumentWorkspacePageOrderNumberField (deps: {
  computed: T_createUseDocumentWorkspacePageDeps['computed']
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  i18n: T_createUseDocumentWorkspacePageDeps['i18n']
  resolveOpenedDocumentTabIsInPreviewMode: T_createUseDocumentWorkspacePageDeps['resolveOpenedDocumentTabIsInPreviewMode']
  routeDocumentId: I_computedRef<string>
  updateTreeOrderNumberDraft: (documentId: string, value: string) => void
}): {
    orderNumberFieldDescription: I_computedRef<string>
    orderNumberFieldLabel: I_computedRef<string>
    orderNumberFieldReadOnly: I_computedRef<boolean>
    orderNumberModel: I_computedRef<string>
  } {
  const orderNumberFieldLabel = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.orderNumberFieldLabel')
  })

  const orderNumberFieldDescription = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.orderNumberFieldDescription')
  })

  const orderNumberFieldReadOnly = deps.computed(() => {
    const tab = deps.documentTab.value
    if (tab === null) {
      return true
    }
    return deps.resolveOpenedDocumentTabIsInPreviewMode(tab.editState)
  })

  const orderNumberModel = deps.computed({
    get () {
      return deps.documentTab.value?.treeOrderNumberDraft ?? ''
    },
    set (value: string) {
      if (deps.routeDocumentId.value.length === 0 || orderNumberFieldReadOnly.value) {
        return
      }
      deps.updateTreeOrderNumberDraft(deps.routeDocumentId.value, value)
    }
  })

  return {
    orderNumberFieldDescription,
    orderNumberFieldLabel,
    orderNumberFieldReadOnly,
    orderNumberModel
  }
}
