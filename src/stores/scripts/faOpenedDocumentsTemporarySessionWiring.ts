import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import {
  applyTemporaryOpenedDocumentParent,
  resolveOpenedDocumentTabIsTemporary
} from 'app/src/scripts/openedDocuments/functions/openedDocumentTemporaryDomain'

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

  try {
    await api.getWorldById(worldId)
    await api.getDocumentTemplateById(templateId)
  } catch {
    return null
  }

  const parentDocumentId = tab.parentDocumentId ?? null
  if (parentDocumentId === null) {
    return tab
  }

  try {
    await api.getDocumentById(parentDocumentId)
    return tab
  } catch {
    return applyTemporaryOpenedDocumentParent(tab, null)
  }
}
