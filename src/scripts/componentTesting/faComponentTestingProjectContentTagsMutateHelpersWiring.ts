import type {
  I_faProjectDocumentTagAssignmentInput,
  I_faProjectDocumentTagRef,
  I_faProjectTag,
  I_faProjectTagWithDocumentCount
} from 'app/types/I_faProjectTagDomain'

import { getFaComponentTestingProjectContentOverrides } from './faComponentTestingProjectContentOverridesWiring'

export function resolveFaComponentTestingDocumentWorldId (documentId: string): string | null {
  const overrides = getFaComponentTestingProjectContentOverrides()
  const document = overrides?.documentsById?.[documentId]
  if (document === undefined) {
    return null
  }
  return document.worldId
}

export function upsertFaComponentTestingTagInWorldMaps (
  worldId: string,
  tag: I_faProjectTag,
  counts: I_faProjectTagWithDocumentCount
): void {
  const overrides = getFaComponentTestingProjectContentOverrides()
  if (overrides === null) {
    return
  }
  const tagsByWorldId = overrides.tagsByWorldId ?? {}
  const nextWorldTags = [...(tagsByWorldId[worldId] ?? [])]
  const existingIndex = nextWorldTags.findIndex((row) => row.id === tag.id)
  if (existingIndex >= 0) {
    nextWorldTags[existingIndex] = tag
  } else {
    nextWorldTags.push(tag)
  }
  overrides.tagsByWorldId = {
    ...tagsByWorldId,
    [worldId]: nextWorldTags
  }
  const countsByWorldId = overrides.tagsWithCountsByWorldId ?? {}
  const nextCounts = [...(countsByWorldId[worldId] ?? [])]
  const countIndex = nextCounts.findIndex((row) => row.id === tag.id)
  if (countIndex >= 0) {
    nextCounts[countIndex] = counts
  } else {
    nextCounts.push(counts)
  }
  overrides.tagsWithCountsByWorldId = {
    ...countsByWorldId,
    [worldId]: nextCounts
  }
}

export function resolveFaComponentTestingTagAssignmentToRef (
  worldId: string,
  assignment: I_faProjectDocumentTagAssignmentInput
): I_faProjectDocumentTagRef {
  const overrides = getFaComponentTestingProjectContentOverrides()
  const worldTags = overrides?.tagsByWorldId?.[worldId] ?? []
  const normalizedName = assignment.name.trim()
  const existingByName = worldTags.find((tag) => {
    return tag.name.localeCompare(normalizedName, undefined, { sensitivity: 'accent' }) === 0
  })
  if (existingByName !== undefined) {
    return {
      id: existingByName.id,
      name: existingByName.name
    }
  }
  if (assignment.isNew === true || worldTags.every((tag) => tag.id !== assignment.id)) {
    const now = Date.now()
    const created: I_faProjectTag = {
      createdAtMs: now,
      id: assignment.id,
      name: normalizedName,
      updatedAtMs: now,
      worldId
    }
    upsertFaComponentTestingTagInWorldMaps(worldId, created, {
      categoryCount: 0,
      documentCount: 1,
      id: created.id,
      name: created.name
    })
    return {
      id: created.id,
      name: created.name
    }
  }
  return {
    id: assignment.id,
    name: normalizedName
  }
}

export function normalizeFaComponentTestingTagName (name: string): string {
  return name.trim()
}
