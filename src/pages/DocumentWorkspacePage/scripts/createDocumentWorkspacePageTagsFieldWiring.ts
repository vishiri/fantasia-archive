import type { T_createUseDocumentWorkspacePageDeps } from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_faSelectInputObjectItem } from 'app/types/I_faSelectInput'

import { listFaProjectTagsForWorldForRenderer } from 'app/src/scripts/componentTesting/componentTesting_manager'

import { createDocumentWorkspacePageTagsField } from './functions/createDocumentWorkspacePageTagsField'

export function wireDocumentWorkspacePageTagsField (input: {
  deps: T_createUseDocumentWorkspacePageDeps & {
    ref: <T>(value: T) => import('app/types/I_vueCompositionShims').I_ref<T>
  }
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  openedDocumentsStore: ReturnType<T_createUseDocumentWorkspacePageDeps['S_FaOpenedDocuments']> & {
    updateTagsDraft: (
      documentId: string,
      value: import('app/types/I_faProjectTagDomain').I_faProjectDocumentTagAssignmentInput[]
    ) => void
  }
  routeDocumentId: I_computedRef<string>
}) {
  return createDocumentWorkspacePageTagsField({
    computed: input.deps.computed,
    documentTab: input.documentTab,
    i18n: input.deps.i18n,
    listTagsForWorld: async (worldId) => {
      const result = await listFaProjectTagsForWorldForRenderer({ worldId })
      return result.items.map((tag): I_faSelectInputObjectItem => {
        return {
          id: tag.id,
          name: tag.name
        }
      })
    },
    ref: input.deps.ref,
    resolveOpenedDocumentTabIsInPreviewMode: input.deps.resolveOpenedDocumentTabIsInPreviewMode,
    routeDocumentId: input.routeDocumentId,
    updateTagsDraft: input.openedDocumentsStore.updateTagsDraft.bind(input.openedDocumentsStore)
  })
}
