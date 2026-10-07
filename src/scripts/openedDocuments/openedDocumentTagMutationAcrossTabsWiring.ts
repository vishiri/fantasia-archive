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
    const renameInput = {
      sourceTagId,
      survivingTagId: input.survivingTagId,
      survivingTagName: input.survivingTagName
    }
    const savedTags = savedTagsAfterRename(tab, renameInput)
    const tagsDraft = tagsDraftAfterRename(tab, renameInput)
    const nextTab = {
      ...tab,
      savedTags,
      tagsDraft
    }
    const hasUnsavedChanges = recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
    return {
      ...nextTab,
      hasUnsavedChanges
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
    const savedTags = savedTagsAfterDelete(tab, input.deletedTagId)
    const tagsDraft = tagsDraftAfterDelete(tab, input.deletedTagId)
    const nextTab = {
      ...tab,
      savedTags,
      tagsDraft
    }
    const hasUnsavedChanges = recomputeOpenedDocumentTabHasUnsavedChanges(nextTab)
    return {
      ...nextTab,
      hasUnsavedChanges
    }
  })
}

function savedTagsAfterRename (
  tab: I_faOpenedDocumentTab,
  input: {
    sourceTagId: string
    survivingTagId: string
    survivingTagName: string
  }
): I_faProjectDocumentTagRef[] | undefined {
  if (tab.savedTags === undefined) {
    return undefined
  }
  return rewriteTagRefListForRename(tab.savedTags, input)
}

function tagsDraftAfterRename (
  tab: I_faOpenedDocumentTab,
  input: {
    sourceTagId: string
    survivingTagId: string
    survivingTagName: string
  }
): I_faProjectDocumentTagAssignmentInput[] | undefined {
  if (tab.tagsDraft === undefined) {
    return undefined
  }
  return rewriteTagListForRename(tab.tagsDraft, input)
}

function savedTagsAfterDelete (
  tab: I_faOpenedDocumentTab,
  deletedTagId: string
): I_faProjectDocumentTagRef[] | undefined {
  if (tab.savedTags === undefined) {
    return undefined
  }
  return tab.savedTags.filter((tag) => tag.id !== deletedTagId)
}

function tagsDraftAfterDelete (
  tab: I_faOpenedDocumentTab,
  deletedTagId: string
): I_faProjectDocumentTagAssignmentInput[] | undefined {
  if (tab.tagsDraft === undefined) {
    return undefined
  }
  return tab.tagsDraft.filter((tag) => tag.id !== deletedTagId)
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
