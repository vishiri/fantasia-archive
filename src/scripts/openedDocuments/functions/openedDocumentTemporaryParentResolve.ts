import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Builds ordered document ids from the intended parent upward via getDocumentById.
 */
export async function buildTemporaryDocumentParentResolveDocumentIds (deps: {
  getDocumentById: (documentId: string) => Promise<{ parentDocumentId: string | null }>
  startDocumentId: string
}): Promise<string[]> {
  const chain: string[] = []
  let currentDocumentId: string | null = deps.startDocumentId
  while (currentDocumentId !== null) {
    chain.push(currentDocumentId)
    const document = await deps.getDocumentById(currentDocumentId)
    currentDocumentId = document.parentDocumentId ?? null
  }
  return chain
}

/**
 * Builds parent resolve chain for a child of an opened tab, including unsaved temporary parents.
 */
export async function buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab (deps: {
  getDocumentById: (documentId: string) => Promise<{ parentDocumentId: string | null }>
  sourceTab: I_faOpenedDocumentTab
}): Promise<string[]> {
  if (deps.sourceTab.persistenceState === 'temporary') {
    const chain: string[] = [deps.sourceTab.documentId]
    const parentChain = deps.sourceTab.temporaryParentResolveDocumentIds ?? []
    for (const documentId of parentChain) {
      if (documentId !== deps.sourceTab.documentId) {
        chain.push(documentId)
      }
    }
    return chain
  }

  return buildTemporaryDocumentParentResolveDocumentIds({
    getDocumentById: deps.getDocumentById,
    startDocumentId: deps.sourceTab.documentId
  })
}

/**
 * Picks the first id in the resolve chain that still exists in the project database.
 */
export function resolveTemporaryDocumentParentDocumentIdForSave (input: {
  chain: readonly string[]
  isDocumentIdAvailable: (documentId: string) => boolean
}): string | null {
  for (const documentId of input.chain) {
    if (input.isDocumentIdAvailable(documentId)) {
      return documentId
    }
  }
  return null
}
