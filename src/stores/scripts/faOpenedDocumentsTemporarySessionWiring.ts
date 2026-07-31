import { ResultAsync } from 'neverthrow'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import {
  applyTemporaryOpenedDocumentParent,
  resolveOpenedDocumentTabIsTemporary
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'

type T_projectContentApiForTemporaryTabHydration = {
  getDocumentById: (id: string) => Promise<unknown>
  getDocumentTemplateById: (id: string) => Promise<unknown>
  getWorldById: (id: string) => Promise<unknown>
}

/**
 * Revalidates a temporary tab against project content; returns null when world or template is gone.
 */
export async function reconcileTemporaryOpenedDocumentTabFromSnapshot (
  tab: I_faOpenedDocumentTab,
  api: T_projectContentApiForTemporaryTabHydration
): Promise<I_faOpenedDocumentTab | null> {
  if (!resolveOpenedDocumentTabIsTemporary(tab.persistenceState)) {
    return tab
  }

  const worldId = tab.worldId
  const templateId = tab.templateId
  if (worldId === undefined || templateId === undefined) {
    return null
  }

  const worldAndTemplateResult = await ResultAsync.fromPromise(
    (async () => {
      await api.getWorldById(worldId)
      await api.getDocumentTemplateById(templateId)
    })(),
    (error): unknown => error
  )
  if (worldAndTemplateResult.isErr()) {
    return null
  }

  const parentDocumentId = tab.parentDocumentId ?? null
  if (parentDocumentId === null) {
    return tab
  }

  const parentResult = await ResultAsync.fromPromise(
    api.getDocumentById(parentDocumentId),
    (error): unknown => error
  )
  if (parentResult.isOk()) {
    return tab
  }
  return applyTemporaryOpenedDocumentParent(tab, null)
}
