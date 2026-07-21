import type { T_createUseDocumentWorkspacePageDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function createDocumentWorkspacePageExtraHtmlClassesField (deps: {
  computed: T_createUseDocumentWorkspacePageDeps['computed']
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  i18n: T_createUseDocumentWorkspacePageDeps['i18n']
  resolveOpenedDocumentTabIsInPreviewMode: T_createUseDocumentWorkspacePageDeps['resolveOpenedDocumentTabIsInPreviewMode']
  routeDocumentId: I_computedRef<string>
  updateExtraClassesDraft: (documentId: string, value: string) => void
}): {
    extraHtmlClassesFieldDescription: I_computedRef<string>
    extraHtmlClassesFieldLabel: I_computedRef<string>
    extraHtmlClassesFieldReadOnly: I_computedRef<boolean>
    extraHtmlClassesModel: I_computedRef<string>
    workspacePageExtraHtmlClassList: I_computedRef<string[]>
  } {
  const extraHtmlClassesFieldLabel = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.extraHtmlClassesFieldLabel')
  })

  const extraHtmlClassesFieldDescription = deps.computed(() => {
    return deps.i18n.global.t('documentWorkspacePage.extraHtmlClassesFieldDescription')
  })

  const extraHtmlClassesFieldReadOnly = deps.computed(() => {
    const tab = deps.documentTab.value
    if (tab === null) {
      return true
    }
    return deps.resolveOpenedDocumentTabIsInPreviewMode(tab.editState)
  })

  const extraHtmlClassesModel = deps.computed({
    get () {
      return deps.documentTab.value?.extraClassesDraft ?? ''
    },
    set (value: string) {
      if (deps.routeDocumentId.value.length === 0 || extraHtmlClassesFieldReadOnly.value) {
        return
      }
      deps.updateExtraClassesDraft(deps.routeDocumentId.value, value.trim())
    }
  })

  const workspacePageExtraHtmlClassList = deps.computed(() => {
    const draft = deps.documentTab.value?.extraClassesDraft ?? ''
    const trimmed = draft.trim()
    if (trimmed.length === 0) {
      return []
    }
    return trimmed.split(/\s+/).filter((token) => token.length > 0)
  })

  return {
    extraHtmlClassesFieldDescription,
    extraHtmlClassesFieldLabel,
    extraHtmlClassesFieldReadOnly,
    extraHtmlClassesModel,
    workspacePageExtraHtmlClassList
  }
}
