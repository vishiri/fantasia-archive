import { ResultAsync } from 'neverthrow'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import {
  normalizeOpenedDocumentParentIdFromDb,
  recomputeOpenedDocumentTabHasUnsavedChanges,
  remapOpenedDocumentTabParentAfterDeletedDocument,
  resolveOpenedDocumentTabIsTemporary
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'

import { isFaProjectContentMissingRowError } from './faOpenedDocumentsTemporarySessionWiring'

type T_deletedParentDocumentRow = {
  parentDocumentId?: string | null | undefined
}

function tabStillNamesDeletedParent (
  tab: I_faOpenedDocumentTab,
  deletedDocumentId: string
): boolean {
  return tab.parentDocumentIdDraft === deletedDocumentId ||
    tab.savedParentDocumentId === deletedDocumentId ||
    tab.parentDocumentId === deletedDocumentId
}

function collectPersistedTabsNamingDeletedParent (
  tabs: readonly I_faOpenedDocumentTab[],
  deletedDocumentId: string
): string[] {
  const documentIds: string[] = []
  for (const tab of tabs) {
    if (!tabStillNamesDeletedParent(tab, deletedDocumentId)) {
      continue
    }
    if (resolveOpenedDocumentTabIsTemporary(tab.persistenceState)) {
      continue
    }
    documentIds.push(tab.documentId)
  }
  return documentIds
}

async function readPromotedParentDocumentId (
  documentId: string,
  getDocumentById: (documentId: string) => Promise<T_deletedParentDocumentRow>
): Promise<string | undefined> {
  const loaded = await ResultAsync.fromPromise(
    getDocumentById(documentId),
    (error): unknown => error
  )
  if (loaded.isErr()) {
    if (!isFaProjectContentMissingRowError(loaded.error)) {
      console.error(
        '[S_FaOpenedDocuments] refresh parent after delete failed',
        loaded.error
      )
    }
    return undefined
  }
  return normalizeOpenedDocumentParentIdFromDb(loaded.value.parentDocumentId)
}

function applyPromotedParentsOntoLiveTabs (
  liveTabs: readonly I_faOpenedDocumentTab[],
  deletedDocumentId: string,
  promotedParentByDocumentId: ReadonlyMap<string, string>
): I_faOpenedDocumentTab[] | null {
  let changed = false
  const nextTabs = liveTabs.map((tab) => {
    const nextParentDocumentId = promotedParentByDocumentId.get(tab.documentId)
    if (nextParentDocumentId === undefined) {
      return tab
    }
    const remapped = remapOpenedDocumentTabParentAfterDeletedDocument(
      tab,
      deletedDocumentId,
      nextParentDocumentId
    )
    if (remapped === null) {
      return tab
    }
    const hasUnsavedChanges = recomputeOpenedDocumentTabHasUnsavedChanges(remapped)
    const parentUnchanged = remapped.parentDocumentIdDraft === tab.parentDocumentIdDraft &&
      remapped.savedParentDocumentId === tab.savedParentDocumentId &&
      remapped.parentDocumentId === tab.parentDocumentId &&
      hasUnsavedChanges === tab.hasUnsavedChanges
    if (parentUnchanged) {
      return tab
    }
    changed = true
    const nextTab = {
      ...remapped,
      hasUnsavedChanges
    }
    return nextTab
  })
  if (!changed) {
    return null
  }
  return nextTabs
}

/**
 * After a document delete, open persisted child tabs follow the promoted parent row.
 * Reads finish first, then parent fields merge onto the tabs still open, so a draft
 * typed or a tab closed during those reads stays.
 * Temporary tabs keep their ancestor chain and resolve it on first save.
 */
export async function refreshOpenedDocumentTabsAfterDeletedParent (input: {
  deletedDocumentId: string
  getDocumentById: (documentId: string) => Promise<T_deletedParentDocumentRow>
  hasDocumentReader: boolean
  readLiveTabs: () => readonly I_faOpenedDocumentTab[]
}): Promise<I_faOpenedDocumentTab[] | null> {
  if (!input.hasDocumentReader) {
    return null
  }
  const documentIds = collectPersistedTabsNamingDeletedParent(
    input.readLiveTabs(),
    input.deletedDocumentId
  )
  const promotedParentByDocumentId = new Map<string, string>()
  for (const documentId of documentIds) {
    const nextParentDocumentId = await readPromotedParentDocumentId(
      documentId,
      input.getDocumentById
    )
    if (nextParentDocumentId === undefined) {
      continue
    }
    promotedParentByDocumentId.set(documentId, nextParentDocumentId)
  }
  return applyPromotedParentsOntoLiveTabs(
    input.readLiveTabs(),
    input.deletedDocumentId,
    promotedParentByDocumentId
  )
}
