import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeTagSettings,
  I_faProjectHierarchyTreeWorkspaceTag,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faProjectTagDocumentChild } from 'app/types/I_faProjectTagDomain'

/** Material icon for individual tag rows. */
export const PROJECT_HIERARCHY_TREE_TAG_ICON = 'mdi-tag'

/** Material icon for compact tags wrapper row. */
export const PROJECT_HIERARCHY_TREE_TAG_WRAPPER_ICON = 'mdi-tag-multiple'

type T_lazyPlaceholderApi = {
  resolveLazyChildren: (parent: I_faProjectHierarchyTreeHeTreeNode) => I_faProjectHierarchyTreeHeTreeNode[]
  syncProjectHierarchyTreeNodeLazyChildren: (node: I_faProjectHierarchyTreeHeTreeNode) => void
}

/**
 * Stable he-tree id for a document mirrored under a tag (avoids collision with main-tree id).
 */
export function resolveProjectHierarchyTreeDocumentUnderTagNodeId (
  tagId: string,
  documentId: string
): string {
  return `${tagId}__doc__${documentId}`
}

/**
 * Stable he-tree id for the compact tags wrapper under a world.
 */
export function resolveProjectHierarchyTreeTagWrapperNodeId (worldId: string): string {
  return `${worldId}__tagWrapper`
}

/**
 * Alphabetical sort for per-world tags (case-insensitive, id tie-break).
 */
export function sortProjectHierarchyTreeWorkspaceTagsAlphabetically (
  tags: readonly I_faProjectHierarchyTreeWorkspaceTag[]
): I_faProjectHierarchyTreeWorkspaceTag[] {
  return [...tags].sort((left, right) => {
    const nameDelta = left.name.localeCompare(right.name, undefined, {
      sensitivity: 'accent'
    })
    return nameDelta !== 0 ? nameDelta : left.id.localeCompare(right.id)
  })
}

/**
 * Maps one tag skeleton row (lazy document children).
 */
export function mapProjectHierarchyTreeTagToNode (input: {
  lazyPlaceholderApi: T_lazyPlaceholderApi
  tag: I_faProjectHierarchyTreeWorkspaceTag
  world: Pick<I_faProjectHierarchyTreeWorkspaceWorld, 'color' | 'id'>
}): I_faProjectHierarchyTreeHeTreeNode {
  const hasChildren = (input.tag.documentCount + input.tag.categoryCount) > 0
  const node: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: false,
    categoryCount: input.tag.categoryCount,
    documentCount: input.tag.documentCount,
    documentId: null,
    groupId: null,
    hasChildren,
    icon: PROJECT_HIERARCHY_TREE_TAG_ICON,
    id: input.tag.id,
    label: input.tag.name,
    nodeKind: 'tag',
    placementId: null,
    tagId: input.tag.id,
    worldColor: input.world.color,
    worldId: input.world.id
  }
  node.children = input.lazyPlaceholderApi.resolveLazyChildren(node)
  return node
}

/**
 * Maps alphabetically ordered tag nodes for a world (no wrapper).
 */
export function mapProjectHierarchyTreeTagNodesForWorld (input: {
  lazyPlaceholderApi: T_lazyPlaceholderApi
  tags: readonly I_faProjectHierarchyTreeWorkspaceTag[]
  world: Pick<I_faProjectHierarchyTreeWorkspaceWorld, 'color' | 'id'>
}): I_faProjectHierarchyTreeHeTreeNode[] {
  return sortProjectHierarchyTreeWorkspaceTagsAlphabetically(input.tags).map((tag) => {
    return mapProjectHierarchyTreeTagToNode({
      lazyPlaceholderApi: input.lazyPlaceholderApi,
      tag,
      world: input.world
    })
  })
}

/**
 * Compact mode: one wrapper node whose children are tag nodes.
 */
export function mapProjectHierarchyTreeTagWrapperNode (input: {
  lazyPlaceholderApi: T_lazyPlaceholderApi
  tags: readonly I_faProjectHierarchyTreeWorkspaceTag[]
  tagsLabel: string
  world: Pick<I_faProjectHierarchyTreeWorkspaceWorld, 'color' | 'id'>
}): I_faProjectHierarchyTreeHeTreeNode {
  const tagChildren = mapProjectHierarchyTreeTagNodesForWorld({
    lazyPlaceholderApi: input.lazyPlaceholderApi,
    tags: input.tags,
    world: input.world
  })
  return {
    children: tagChildren,
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: tagChildren.length > 0,
    icon: PROJECT_HIERARCHY_TREE_TAG_WRAPPER_ICON,
    id: resolveProjectHierarchyTreeTagWrapperNodeId(input.world.id),
    label: input.tagsLabel,
    nodeKind: 'tagWrapper',
    placementId: null,
    tagId: null,
    worldColor: input.world.color,
    worldId: input.world.id
  }
}

/**
 * Builds tag branch nodes for a world given App Settings tag chrome flags.
 */
export function resolveProjectHierarchyTreeTagBranchNodes (input: {
  lazyPlaceholderApi: T_lazyPlaceholderApi
  tagSettings: I_faProjectHierarchyTreeTagSettings
  tagsLabel: string
  world: I_faProjectHierarchyTreeWorkspaceWorld
}): I_faProjectHierarchyTreeHeTreeNode[] {
  if (input.tagSettings.noTags) {
    return []
  }
  const tags = input.world.tags ?? []
  if (tags.length === 0) {
    return []
  }
  if (input.tagSettings.compactTags) {
    return [
      mapProjectHierarchyTreeTagWrapperNode({
        lazyPlaceholderApi: input.lazyPlaceholderApi,
        tags,
        tagsLabel: input.tagsLabel,
        world: input.world
      })
    ]
  }
  return mapProjectHierarchyTreeTagNodesForWorld({
    lazyPlaceholderApi: input.lazyPlaceholderApi,
    tags,
    world: input.world
  })
}

/**
 * Inserts tag branch nodes before or after structural children per tagsAtTop.
 */
export function mergeProjectHierarchyTreeWorldChildrenWithTags (input: {
  structuralChildren: I_faProjectHierarchyTreeHeTreeNode[]
  tagBranchNodes: I_faProjectHierarchyTreeHeTreeNode[]
  tagsAtTop: boolean
}): I_faProjectHierarchyTreeHeTreeNode[] {
  if (input.tagBranchNodes.length === 0) {
    return input.structuralChildren
  }
  if (input.tagsAtTop) {
    return [...input.tagBranchNodes, ...input.structuralChildren]
  }
  return [...input.structuralChildren, ...input.tagBranchNodes]
}

/**
 * Maps flat documents-under-tag IPC rows into mirrored document he-tree nodes.
 */
export function mapProjectHierarchyTreeDocumentsUnderTagToNodes (input: {
  items: readonly I_faProjectTagDocumentChild[]
  resolvePlacementDisplayIcon: (icon: string) => string
  tagId: string
  worldColor: string
  worldId: string
}): I_faProjectHierarchyTreeHeTreeNode[] {
  const orderedItems = [...input.items].sort((left, right) => {
    const sortOrderDelta = left.sortOrder - right.sortOrder
    if (sortOrderDelta !== 0) {
      return sortOrderDelta
    }
    const nameDelta = left.displayName.localeCompare(right.displayName, undefined, {
      sensitivity: 'accent'
    })
    return nameDelta !== 0 ? nameDelta : left.documentId.localeCompare(right.documentId)
  })
  return orderedItems.map((item) => {
    return {
      children: [],
      childrenLoaded: true,
      documentBackgroundColor: item.documentBackgroundColor,
      documentId: item.documentId,
      documentTextColor: item.documentTextColor,
      groupId: null,
      hasChildren: false,
      icon: input.resolvePlacementDisplayIcon(''),
      id: resolveProjectHierarchyTreeDocumentUnderTagNodeId(input.tagId, item.documentId),
      isCategory: item.isCategory,
      isDead: item.isDead,
      isFinished: item.isFinished,
      isMinor: item.isMinor,
      label: item.displayName,
      nodeKind: 'document' as const,
      placementId: null,
      tagId: input.tagId,
      treeOrderNumber: item.treeOrderNumber,
      worldColor: input.worldColor,
      worldId: input.worldId
    }
  })
}

/**
 * True when a document row is mirrored under a tag branch (not main hierarchy).
 */
export function isProjectHierarchyTreeDocumentUnderTagNode (
  node: Pick<I_faProjectHierarchyTreeHeTreeNode, 'nodeKind' | 'tagId'>
): boolean {
  return node.nodeKind === 'document' && typeof node.tagId === 'string' && node.tagId.length > 0
}

/**
 * True when rename target conflicts case-insensitively with another same-world tag.
 */
export function resolveProjectHierarchyTreeTagRenameMergeConflict (input: {
  existingTagNames: readonly string[]
  newName: string
  renameTagId: string
  renameTagCurrentName: string
}): boolean {
  const trimmed = input.newName.trim()
  if (trimmed.length === 0) {
    return false
  }
  const normalizedNew = trimmed.toLocaleLowerCase()
  const normalizedCurrent = input.renameTagCurrentName.trim().toLocaleLowerCase()
  if (normalizedNew === normalizedCurrent) {
    return false
  }
  return input.existingTagNames.some((name) => {
    return name.trim().toLocaleLowerCase() === normalizedNew
  })
}
