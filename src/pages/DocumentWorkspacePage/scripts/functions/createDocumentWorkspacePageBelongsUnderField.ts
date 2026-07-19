import type { T_createUseDocumentWorkspacePageDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function createDocumentWorkspacePageBelongsUnderField (deps: {
  computed: T_createUseDocumentWorkspacePageDeps['computed']
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  i18n: T_createUseDocumentWorkspacePageDeps['i18n']
  resolveOpenedDocumentTabIsInPreviewMode: T_createUseDocumentWorkspacePageDeps['resolveOpenedDocumentTabIsInPreviewMode']
  routeDocumentId: I_computedRef<string>
  updateParentDocumentIdDraft: (documentId: string, value: string) => void
}): {
    belongsUnderFieldDescription: I_computedRef<string>
    belongsUnderFieldLabel: I_computedRef<string>
    belongsUnderFieldReadOnly: I_computedRef<boolean>
    belongsUnderModel: I_computedRef<string>
    oneWayRelationshipTooltip: I_computedRef<string>
  } {
  const belongsUnderFieldLabel = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.belongsUnderFieldLabel')
  })

  const belongsUnderFieldDescription = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.belongsUnderFieldDescription')
  })

  const oneWayRelationshipTooltip = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.belongsUnderOneWayRelationshipTooltip')
  })

  const belongsUnderFieldReadOnly = deps.computed(() => {
    const tab = deps.documentTab.value
    if (tab === null) {
      return true
    }
    return deps.resolveOpenedDocumentTabIsInPreviewMode(tab.editState)
  })

  const belongsUnderModel = deps.computed({
    get () {
      return deps.documentTab.value?.parentDocumentIdDraft ?? ''
    },
    set (value: string) {
      if (deps.routeDocumentId.value.length === 0 || belongsUnderFieldReadOnly.value) {
        return
      }
      deps.updateParentDocumentIdDraft(deps.routeDocumentId.value, value)
    }
  })

  return {
    belongsUnderFieldDescription,
    belongsUnderFieldLabel,
    belongsUnderFieldReadOnly,
    belongsUnderModel,
    oneWayRelationshipTooltip
  }
}
