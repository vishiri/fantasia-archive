import type {
  I_faProjectHierarchyTreeWorkspaceLayoutResult,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type {
  I_faProjectDocumentTagRef,
  I_faProjectListDocumentTagsInput,
  I_faProjectListDocumentsUnderTagInput,
  I_faProjectListDocumentsUnderTagResult,
  I_faProjectListTagsForWorldInput,
  I_faProjectListTagsWithDocumentCountsForWorldInput,
  I_faProjectListTagsWithDocumentCountsForWorldResult,
  I_faProjectTagListResult
} from 'app/types/I_faProjectTagDomain'

import { getFaComponentTestingProjectContentOverrides } from './faComponentTestingProjectContentOverridesWiring'

export {
  deleteFaProjectTagForRenderer,
  renameFaProjectTagForRenderer,
  reorderFaProjectDocumentsUnderTagForRenderer,
  setFaProjectDocumentTagsForRenderer
} from './faComponentTestingProjectContentTagsMutateWiring'

function cloneWorldLayout (
  worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
): I_faProjectHierarchyTreeWorkspaceWorld[] {
  return structuredClone(worlds)
}

/**
 * Lists workspace hierarchy layout from overrides when present, else bridge.
 */
export async function listFaProjectWorkspaceHierarchyLayoutForRenderer (): Promise<
I_faProjectHierarchyTreeWorkspaceLayoutResult
> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  const worlds = overrides?.workspaceHierarchyLayoutWorlds
  if (worlds !== undefined) {
    return {
      worlds: cloneWorldLayout(worlds)
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listWorkspaceHierarchyLayout !== 'function') {
    throw new Error('projectContent.listWorkspaceHierarchyLayout unavailable')
  }
  return await api.listWorkspaceHierarchyLayout()
}

/**
 * Lists tags for a world from overrides when present, else bridge.
 */
export async function listFaProjectTagsForWorldForRenderer (
  input: I_faProjectListTagsForWorldInput
): Promise<I_faProjectTagListResult> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  const map = overrides?.tagsByWorldId
  if (map !== undefined) {
    return {
      items: [...(map[input.worldId] ?? [])]
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listTagsForWorld !== 'function') {
    return {
      items: []
    }
  }
  return await api.listTagsForWorld(input)
}

/**
 * Lists tags with document counts from overrides when present, else bridge.
 */
export async function listFaProjectTagsWithDocumentCountsForWorldForRenderer (
  input: I_faProjectListTagsWithDocumentCountsForWorldInput
): Promise<I_faProjectListTagsWithDocumentCountsForWorldResult> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  const map = overrides?.tagsWithCountsByWorldId
  if (map !== undefined) {
    return {
      items: [...(map[input.worldId] ?? [])]
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listTagsWithDocumentCountsForWorld !== 'function') {
    return {
      items: []
    }
  }
  return await api.listTagsWithDocumentCountsForWorld(input)
}

/**
 * Lists document tag membership from overrides when present, else bridge.
 */
export async function listFaProjectDocumentTagsForRenderer (
  input: I_faProjectListDocumentTagsInput
): Promise<{ items: I_faProjectDocumentTagRef[] }> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  if (overrides !== null) {
    const map = overrides.documentTagsByDocumentId
    return {
      items: [...(map?.[input.documentId] ?? [])]
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listDocumentTags !== 'function') {
    return {
      items: []
    }
  }
  return await api.listDocumentTags(input)
}

/**
 * Lists documents under a tag from overrides when present, else bridge.
 */
export async function listFaProjectDocumentsUnderTagForRenderer (
  input: I_faProjectListDocumentsUnderTagInput
): Promise<I_faProjectListDocumentsUnderTagResult> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  const map = overrides?.documentsUnderTagByTagId
  if (map !== undefined) {
    return {
      items: [...(map[input.tagId] ?? [])]
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listDocumentsUnderTag !== 'function') {
    return {
      items: []
    }
  }
  return await api.listDocumentsUnderTag(input)
}
