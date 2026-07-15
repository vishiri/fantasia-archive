import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Resolves template, world, and parent placement for tab-menu copy and add-under flows.
 * Persisted tabs omit templateId on the tab row; load it from the project database.
 */
export async function resolveOpenedDocumentTabDocumentActionContext (deps: {
  getDocumentById: (documentId: string) => Promise<{
    parentDocumentId: string | null
    templateId: string | null
    worldId: string
  }>
  sourceTab: I_faOpenedDocumentTab
}): Promise<{
  parentDocumentId: string | null
  templateId: string
  worldId: string
} | null> {
  if (deps.sourceTab.persistenceState === 'temporary') {
    const templateId = deps.sourceTab.templateId
    const worldId = deps.sourceTab.worldId
    if (templateId === undefined || worldId === undefined) {
      return null
    }

    return {
      parentDocumentId: deps.sourceTab.parentDocumentId ?? null,
      templateId,
      worldId
    }
  }

  let document
  try {
    document = await deps.getDocumentById(deps.sourceTab.documentId)
  } catch {
    return null
  }

  const templateId = deps.sourceTab.templateId ?? document.templateId
  const worldId = deps.sourceTab.worldId ?? document.worldId
  if (templateId === null || templateId === undefined || worldId === undefined) {
    return null
  }

  return {
    parentDocumentId: document.parentDocumentId,
    templateId,
    worldId
  }
}
