import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type {
  I_faProjectDocumentTagAssignmentInput,
  I_faProjectDocumentTagRef
} from 'app/types/I_faProjectTagDomain'

import { recomputeOpenedDocumentTabHasUnsavedChanges } from './openedDocumentTabAppearanceWiring'

/**
 * Applies rename/merge of a project tag onto open workspace tabs.
 */
export function applyOpenedDocumentTagRenameAcrossTabs (input: {
  merged: boolean
  mergedFromTagId: string | null
  survivingTagId: string
  survivingTagName: string
  tabs: readonly I_faOpenedDocumentTab[]
}): I_faOpenedDocumentTab[] {
  const sourceTagId = input.merged && input.mergedFromTagId !== null
    ? input.mergedFromTagId
    : input.survivingTagId
  return input.tabs.map((tab) => {
    const nextTab = {
      ...tab,
      savedTags: rewriteTagRefListForRename(tab.savedTags ?? [], {
        sourceTagId,
        survivingTagId: input.survivingTagId,
        survivingTagName: input.survivingTagName
      }),
      tagsDraft: rewriteTagListForRename(tab.tagsDraft ?? [], {
        sourceTagId,
        survivingTagId: input.survivingTagId,
        survivingTagName: input.survivingTagName
      })
    }
    return {
      ...nextTab,
      hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
    }
  })
}

/**
 * Removes a deleted tag from open workspace tabs.
 */
export function applyOpenedDocumentTagDeleteAcrossTabs (input: {
  deletedTagId: string
  tabs: readonly I_faOpenedDocumentTab[]
}): I_faOpenedDocumentTab[] {
  return input.tabs.map((tab) => {
    const nextTab = {
      ...tab,
      savedTags: (tab.savedTags ?? []).filter((tag) => tag.id !== input.deletedTagId),
      tagsDraft: (tab.tagsDraft ?? []).filter((tag) => tag.id !== input.deletedTagId)
    }
    return {
      ...nextTab,
      hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
    }
  })
}

function rewriteTagListForRename (
  tags: readonly I_faProjectDocumentTagAssignmentInput[],
  input: {
    sourceTagId: string
    survivingTagId: string
    survivingTagName: string
  }
): I_faProjectDocumentTagAssignmentInput[] {
  const rewritten: I_faProjectDocumentTagAssignmentInput[] = []
  const seen = new Set<string>()
  for (const tag of tags) {
    const nextId = tag.id === input.sourceTagId ? input.survivingTagId : tag.id
    if (seen.has(nextId)) {
      continue
    }
    seen.add(nextId)
    rewritten.push({
      id: nextId,
      name: nextId === input.survivingTagId ? input.survivingTagName : tag.name,
      ...(tag.isNew === true && nextId !== input.survivingTagId ? { isNew: true } : {})
    })
  }
  return rewritten
}

function rewriteTagRefListForRename (
  tags: readonly I_faProjectDocumentTagRef[],
  input: {
    sourceTagId: string
    survivingTagId: string
    survivingTagName: string
  }
): I_faProjectDocumentTagRef[] {
  const rewritten: I_faProjectDocumentTagRef[] = []
  const seen = new Set<string>()
  for (const tag of tags) {
    const nextId = tag.id === input.sourceTagId ? input.survivingTagId : tag.id
    if (seen.has(nextId)) {
      continue
    }
    seen.add(nextId)
    rewritten.push({
      id: nextId,
      name: nextId === input.survivingTagId ? input.survivingTagName : tag.name
    })
  }
  return rewritten
}
