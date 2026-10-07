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
    const clonedWorlds = cloneWorldLayout(worlds)
    return {
      worlds: clonedWorlds
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
    const sourceItems = map[input.worldId] ?? []
    const items = [...sourceItems]
    return {
      items
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listTagsForWorld !== 'function') {
    const items: I_faProjectTagListResult['items'] = []
    return {
      items
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
    const sourceItems = map[input.worldId] ?? []
    const items = [...sourceItems]
    return {
      items
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listTagsWithDocumentCountsForWorld !== 'function') {
    const items: I_faProjectListTagsWithDocumentCountsForWorldResult['items'] = []
    return {
      items
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
    const sourceItems = map?.[input.documentId] ?? []
    const items = [...sourceItems]
    return {
      items
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listDocumentTags !== 'function') {
    const items: I_faProjectDocumentTagRef[] = []
    return {
      items
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
    const sourceItems = map[input.tagId] ?? []
    const items = [...sourceItems]
    return {
      items
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listDocumentsUnderTag !== 'function') {
    const items: I_faProjectListDocumentsUnderTagResult['items'] = []
    return {
      items
    }
  }
  return await api.listDocumentsUnderTag(input)
}
