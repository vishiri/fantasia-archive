import type { T_createUseDocumentWorkspacePageDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import { createDocumentWorkspacePageOrderNumberField } from './functions/createDocumentWorkspacePageOrderNumberField'

export function wireDocumentWorkspacePageOrderNumberField (input: {
  deps: T_createUseDocumentWorkspacePageDeps
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  openedDocumentsStore: ReturnType<T_createUseDocumentWorkspacePageDeps['S_FaOpenedDocuments']>
  routeDocumentId: I_computedRef<string>
}) {
  return createDocumentWorkspacePageOrderNumberField({
    computed: input.deps.computed,
    documentTab: input.documentTab,
    i18n: input.deps.i18n,
    resolveOpenedDocumentTabIsInPreviewMode: input.deps.resolveOpenedDocumentTabIsInPreviewMode,
    routeDocumentId: input.routeDocumentId,
    updateTreeOrderNumberDraft: input.openedDocumentsStore.updateTreeOrderNumberDraft.bind(
      input.openedDocumentsStore
    )
  })
}
