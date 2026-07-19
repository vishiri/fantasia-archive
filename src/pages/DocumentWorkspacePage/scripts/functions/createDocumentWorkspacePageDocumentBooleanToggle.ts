import type { T_createUseDocumentWorkspacePageDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

type T_documentBooleanDraftField =
  | 'isFinishedDraft'
  | 'isMinorDraft'
  | 'isDeadDraft'

export function createDocumentWorkspacePageDocumentBooleanToggle (deps: {
  computed: T_createUseDocumentWorkspacePageDeps['computed']
  descriptionI18nKey: string
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  draftField: T_documentBooleanDraftField
  i18n: T_createUseDocumentWorkspacePageDeps['i18n']
  resolveOpenedDocumentTabIsInPreviewMode: T_createUseDocumentWorkspacePageDeps['resolveOpenedDocumentTabIsInPreviewMode']
  routeDocumentId: I_computedRef<string>
  titleI18nKey: string
  updateDraft: (documentId: string, value: boolean) => void
}): {
    description: I_computedRef<string>
    model: I_computedRef<boolean>
    readOnly: I_computedRef<boolean>
    title: I_computedRef<string>
  } {
  const title = deps.computed(() => {
    return deps.i18n.global.t(deps.titleI18nKey)
  })

  const description = deps.computed(() => {
    return deps.i18n.global.t(deps.descriptionI18nKey)
  })

  const readOnly = deps.computed(() => {
    const tab = deps.documentTab.value
    if (tab === null) {
      return true
    }
    return deps.resolveOpenedDocumentTabIsInPreviewMode(tab.editState)
  })

  const model = deps.computed({
    get () {
      return deps.documentTab.value?.[deps.draftField] ?? false
    },
    set (value: boolean) {
      if (deps.routeDocumentId.value.length === 0 || readOnly.value) {
        return
      }
      deps.updateDraft(deps.routeDocumentId.value, value)
    }
  })

  return {
    description,
    model,
    readOnly,
    title
  }
}
