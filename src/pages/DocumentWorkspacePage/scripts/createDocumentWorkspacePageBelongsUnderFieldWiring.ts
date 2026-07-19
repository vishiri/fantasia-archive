import type { T_createUseDocumentWorkspacePageDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import { createDocumentWorkspacePageBelongsUnderField } from './functions/createDocumentWorkspacePageBelongsUnderField'

export function wireDocumentWorkspacePageBelongsUnderField (input: {
  deps: T_createUseDocumentWorkspacePageDeps
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  openedDocumentsStore: ReturnType<T_createUseDocumentWorkspacePageDeps['S_FaOpenedDocuments']>
  routeDocumentId: I_computedRef<string>
}) {
  return createDocumentWorkspacePageBelongsUnderField({
    computed: input.deps.computed,
    documentTab: input.documentTab,
    i18n: input.deps.i18n,
    resolveOpenedDocumentTabIsInPreviewMode: input.deps.resolveOpenedDocumentTabIsInPreviewMode,
    routeDocumentId: input.routeDocumentId,
    updateParentDocumentIdDraft: input.openedDocumentsStore.updateParentDocumentIdDraft.bind(
      input.openedDocumentsStore
    )
  })
}
