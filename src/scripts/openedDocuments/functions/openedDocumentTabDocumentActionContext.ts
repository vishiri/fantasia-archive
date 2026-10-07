import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'

/**
 * Resolves template, world, and parent placement for tab-menu copy and add-under flows.
 * Persisted tabs omit templateId on the tab row; load it from the project database.
 */
export async function resolveOpenedDocumentTabDocumentActionContext (deps: {
  ResultAsync: T_injectedResultAsync
  getDocumentById: (documentId: string) => Promise<{
    parentDocumentId: string | null
    placementId?: string | null | undefined
    templateId: string | null
    worldId: string
  }>
  isMissingProjectContentRow: (error: unknown) => boolean
  sourceTab: I_faOpenedDocumentTab
}): Promise<{
  parentDocumentId: string | null
  placementId?: string | null | undefined
  templateId: string
  worldId: string
} | null> {
  if (deps.sourceTab.persistenceState === 'temporary') {
    const templateId = deps.sourceTab.templateId
    const worldId = deps.sourceTab.worldId
    if (templateId === undefined || worldId === undefined) {
      return null
    }

    const parentDocumentId = deps.sourceTab.parentDocumentId ?? null
    const placementId = deps.sourceTab.placementId
    if (placementId === undefined) {
      return {
        parentDocumentId,
        templateId,
        worldId
      }
    }
    return {
      parentDocumentId,
      placementId,
      templateId,
      worldId
    }
  }

  const documentResult = await deps.ResultAsync.fromPromise(
    deps.getDocumentById(deps.sourceTab.documentId),
    (error): unknown => error
  )
  if (documentResult.isErr()) {
    if (deps.isMissingProjectContentRow(documentResult.error)) {
      return null
    }
    const error = documentResult.error
    throw error instanceof Error ? error : new Error(String(error))
  }

  const document = documentResult.value
  const templateId = deps.sourceTab.templateId ?? document.templateId
  const worldId = deps.sourceTab.worldId ?? document.worldId
  if (templateId === null || templateId === undefined || worldId === undefined) {
    return null
  }

  const parentDocumentId = document.parentDocumentId
  const placementId = document.placementId
  if (placementId === undefined) {
    return {
      parentDocumentId,
      templateId,
      worldId
    }
  }
  return {
    parentDocumentId,
    placementId,
    templateId,
    worldId
  }
}
