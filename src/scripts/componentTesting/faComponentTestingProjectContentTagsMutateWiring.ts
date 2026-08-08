import type {
  I_faProjectRenameTagInput,
  I_faProjectRenameTagResult,
  I_faProjectReorderDocumentsUnderTagInput,
  I_faProjectSetDocumentTagsInput,
  I_faProjectSetDocumentTagsResult,
  I_faProjectTag
} from 'app/types/I_faProjectTagDomain'

import { getFaComponentTestingProjectContentOverrides } from './faComponentTestingProjectContentOverridesWiring'
import {
  normalizeFaComponentTestingTagName,
  resolveFaComponentTestingDocumentWorldId,
  resolveFaComponentTestingTagAssignmentToRef
} from './faComponentTestingProjectContentTagsMutateHelpersWiring'

/**
 * Persists document tags into overrides when present, else bridge.
 */
export async function setFaProjectDocumentTagsForRenderer (
  input: I_faProjectSetDocumentTagsInput
): Promise<I_faProjectSetDocumentTagsResult> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  // Any component-testing overrides: keep tags in memory. Do not fall through to
  // project SQLite IPC when seeds only install documentsById / templates / worlds.
  if (overrides !== null) {
    const worldId = resolveFaComponentTestingDocumentWorldId(input.documentId) ?? ''
    const items = input.tags.map((assignment) => {
      return resolveFaComponentTestingTagAssignmentToRef(worldId, assignment)
    })
    const nextDocumentTags = {
      ...(overrides.documentTagsByDocumentId ?? {}),
      [input.documentId]: items
    }
    overrides.documentTagsByDocumentId = nextDocumentTags
    return {
      items: [...items]
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.setDocumentTags !== 'function') {
    return {
      items: []
    }
  }
  return await api.setDocumentTags(input)
}

/**
 * Renames or merges a tag in overrides when present, else bridge.
 */
export async function renameFaProjectTagForRenderer (
  input: I_faProjectRenameTagInput
): Promise<I_faProjectRenameTagResult> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  const tagsByWorldId = overrides?.tagsByWorldId
  if (tagsByWorldId !== undefined) {
    let sourceWorldId: string | null = null
    let sourceTag: I_faProjectTag | null = null
    for (const [worldId, tags] of Object.entries(tagsByWorldId)) {
      const found = tags.find((tag) => tag.id === input.tagId)
      if (found !== undefined) {
        sourceWorldId = worldId
        sourceTag = found
        break
      }
    }
    if (sourceWorldId === null || sourceTag === null) {
      throw new Error('renameTag: tag not found in overrides')
    }
    const overridesRecord = overrides as NonNullable<typeof overrides>
    const nextName = normalizeFaComponentTestingTagName(input.newName)
    const worldTags = tagsByWorldId[sourceWorldId] ?? []
    const clash = worldTags.find((tag) => {
      return tag.id !== input.tagId &&
        tag.name.localeCompare(nextName, undefined, { sensitivity: 'accent' }) === 0
    })
    const now = Date.now()
    if (clash !== undefined) {
      const remaining = worldTags.filter((tag) => tag.id !== input.tagId)
      tagsByWorldId[sourceWorldId] = remaining
      const countsMap = overridesRecord.tagsWithCountsByWorldId ?? {}
      const counts = [...(countsMap[sourceWorldId] ?? [])].filter((row) => row.id !== input.tagId)
      countsMap[sourceWorldId] = counts
      overridesRecord.tagsWithCountsByWorldId = countsMap
      const underTagMap = overridesRecord.documentsUnderTagByTagId ?? {}
      const mergedDocs = [
        ...(underTagMap[clash.id] ?? []),
        ...(underTagMap[input.tagId] ?? [])
      ]
      underTagMap[clash.id] = mergedDocs
      delete underTagMap[input.tagId]
      overridesRecord.documentsUnderTagByTagId = underTagMap
      const docTagsMap = overridesRecord.documentTagsByDocumentId ?? {}
      for (const [documentId, refs] of Object.entries(docTagsMap)) {
        docTagsMap[documentId] = refs.map((ref) => {
          if (ref.id !== input.tagId) {
            return ref
          }
          return {
            id: clash.id,
            name: clash.name
          }
        })
      }
      overridesRecord.documentTagsByDocumentId = docTagsMap
      return {
        merged: true,
        mergedFromTagId: input.tagId,
        tag: clash
      }
    }
    const renamed: I_faProjectTag = {
      ...sourceTag,
      name: nextName,
      updatedAtMs: now
    }
    tagsByWorldId[sourceWorldId] = worldTags.map((tag) => {
      return tag.id === input.tagId ? renamed : tag
    })
    const countsMap = overridesRecord.tagsWithCountsByWorldId ?? {}
    countsMap[sourceWorldId] = (countsMap[sourceWorldId] ?? []).map((row) => {
      if (row.id !== input.tagId) {
        return row
      }
      return {
        ...row,
        name: nextName
      }
    })
    overridesRecord.tagsWithCountsByWorldId = countsMap
    return {
      merged: false,
      mergedFromTagId: null,
      tag: renamed
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.renameTag !== 'function') {
    throw new Error('projectContent.renameTag unavailable')
  }
  return await api.renameTag(input)
}

/**
 * Deletes a tag from overrides when present, else bridge.
 */
export async function deleteFaProjectTagForRenderer (
  input: { tagId: string }
): Promise<void> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  const tagsByWorldId = overrides?.tagsByWorldId
  if (tagsByWorldId !== undefined) {
    const overridesRecord = overrides as NonNullable<typeof overrides>
    for (const [worldId, tags] of Object.entries(tagsByWorldId)) {
      tagsByWorldId[worldId] = tags.filter((tag) => tag.id !== input.tagId)
      const countsMap = overridesRecord.tagsWithCountsByWorldId ?? {}
      countsMap[worldId] = (countsMap[worldId] ?? []).filter((row) => row.id !== input.tagId)
      overridesRecord.tagsWithCountsByWorldId = countsMap
    }
    const underTagMap = overridesRecord.documentsUnderTagByTagId ?? {}
    delete underTagMap[input.tagId]
    overridesRecord.documentsUnderTagByTagId = underTagMap
    const docTagsMap = overridesRecord.documentTagsByDocumentId ?? {}
    for (const [documentId, refs] of Object.entries(docTagsMap)) {
      docTagsMap[documentId] = refs.filter((ref) => ref.id !== input.tagId)
    }
    overridesRecord.documentTagsByDocumentId = docTagsMap
    if (overridesRecord.workspaceHierarchyLayoutWorlds !== undefined) {
      overridesRecord.workspaceHierarchyLayoutWorlds = overridesRecord.workspaceHierarchyLayoutWorlds.map((world) => {
        return {
          ...world,
          tags: (world.tags ?? []).filter((tag) => tag.id !== input.tagId)
        }
      })
    }
    return
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.deleteTag !== 'function') {
    return
  }
  await api.deleteTag(input)
}

/**
 * Reorders documents under a tag in overrides when present, else bridge.
 */
export async function reorderFaProjectDocumentsUnderTagForRenderer (
  input: I_faProjectReorderDocumentsUnderTagInput
): Promise<void> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  const map = overrides?.documentsUnderTagByTagId
  if (map !== undefined) {
    const current = map[input.tagId] ?? []
    const byId = new Map(current.map((row) => [row.documentId, row]))
    map[input.tagId] = input.orderedDocumentIds.flatMap((documentId, index) => {
      const row = byId.get(documentId)
      if (row === undefined) {
        return []
      }
      return [{
        ...row,
        sortOrder: index
      }]
    })
    return
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.reorderDocumentsUnderTag !== 'function') {
    return
  }
  await api.reorderDocumentsUnderTag(input)
}
