import { ResultAsync } from 'neverthrow'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import {
  applyTemporaryOpenedDocumentParent,
  resolveOpenedDocumentParentIdDraftForPersist,
  resolveOpenedDocumentTabIsTemporary,
  resolveTemporaryDocumentParentDocumentIdForSave
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'

type T_projectContentApiForTemporaryTabHydration = {
  getDocumentById: (id: string) => Promise<unknown>
  getDocumentTemplateById: (id: string) => Promise<unknown>
  getWorldById: (id: string) => Promise<unknown>
}

/**
 * True when main rejected because the row id is gone, including Electron's remote-method wrapper.
 */
export function isFaProjectContentMissingRowError (error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  const name = error instanceof Error ? error.name : ''
  const hasNotFoundName = name === 'FaProjectContentNotFoundError' ||
    message.includes('FaProjectContentNotFoundError')
  const hasNotFoundMessage = message.includes(' not found:')
  return hasNotFoundName || hasNotFoundMessage
}

/**
 * Missing rows return null. Any other read failure is thrown for the caller.
 */
export function throwUnlessFaProjectContentMissingRow (error: unknown): null {
  if (isFaProjectContentMissingRowError(error)) {
    return null
  }
  if (error instanceof Error) {
    throw error
  }
  throw new Error(String(error))
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
    if (isFaProjectContentMissingRowError(worldAndTemplateResult.error)) {
      return null
    }
    return tab
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
  if (!isFaProjectContentMissingRowError(parentResult.error)) {
    return tab
  }
  const draftParentDocumentId = resolveOpenedDocumentParentIdDraftForPersist(
    tab.parentDocumentIdDraft ?? ''
  )
  const resolvedParentResult = await ResultAsync.fromPromise(
    resolveTemporaryOpenedDocumentParentIdForSave({
      draftParentDocumentId,
      getDocumentById: (documentId) => api.getDocumentById(documentId),
      parentResolveChain: tab.temporaryParentResolveDocumentIds ?? []
    }),
    (error): unknown => error
  )
  if (resolvedParentResult.isErr()) {
    return tab
  }
  return applyTemporaryOpenedDocumentParent(tab, resolvedParentResult.value)
}

/**
 * Resolves a temporary document parent for create.
 * A missing row falls back along the ancestor chain. Any other read failure aborts the save.
 */
export async function resolveTemporaryOpenedDocumentParentIdForSave (input: {
  draftParentDocumentId: string | null
  getDocumentById: (documentId: string) => Promise<unknown>
  parentResolveChain: readonly string[]
}): Promise<string | null> {
  const availableDocumentIds = new Set<string>()
  for (const chainDocumentId of input.parentResolveChain) {
    const chainDocumentResult = await ResultAsync.fromPromise(
      input.getDocumentById(chainDocumentId),
      (error): unknown => error
    )
    if (chainDocumentResult.isOk()) {
      availableDocumentIds.add(chainDocumentId)
      continue
    }
    if (!isFaProjectContentMissingRowError(chainDocumentResult.error)) {
      const error = chainDocumentResult.error
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
  if (input.draftParentDocumentId === null) {
    return null
  }
  const parentDocumentResult = await ResultAsync.fromPromise(
    input.getDocumentById(input.draftParentDocumentId),
    (error): unknown => error
  )
  if (parentDocumentResult.isOk()) {
    return input.draftParentDocumentId
  }
  if (!isFaProjectContentMissingRowError(parentDocumentResult.error)) {
    const error = parentDocumentResult.error
    throw error instanceof Error ? error : new Error(String(error))
  }
  return resolveTemporaryDocumentParentDocumentIdForSave({
    chain: input.parentResolveChain,
    isDocumentIdAvailable: (chainDocumentId) => availableDocumentIds.has(chainDocumentId)
  })
}
