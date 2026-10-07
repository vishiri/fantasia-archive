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
  const hasChildren = tagChildren.length > 0
  const id = resolveProjectHierarchyTreeTagWrapperNodeId(input.world.id)
  const label = input.tagsLabel
  const worldColor = input.world.color
  const worldId = input.world.id
  return {
    children: tagChildren,
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren,
    icon: PROJECT_HIERARCHY_TREE_TAG_WRAPPER_ICON,
    id,
    label,
    nodeKind: 'tagWrapper',
    placementId: null,
    tagId: null,
    worldColor,
    worldId
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
    if (nameDelta !== 0) {
      return nameDelta
    }
    const createdAtDelta = (left.createdAtMs ?? 0) - (right.createdAtMs ?? 0)
    if (createdAtDelta !== 0) {
      return createdAtDelta
    }
    return left.documentId.localeCompare(right.documentId)
  })
  return orderedItems.map((item) => {
    const children: I_faProjectHierarchyTreeHeTreeNode[] = []
    const documentBackgroundColor = item.documentBackgroundColor
    const documentId = item.documentId
    const documentTextColor = item.documentTextColor
    const templateIcon = item.templateIcon ?? ''
    const icon = input.resolvePlacementDisplayIcon(templateIcon)
    const id = resolveProjectHierarchyTreeDocumentUnderTagNodeId(input.tagId, item.documentId)
    const isCategory = item.isCategory
    const isDead = item.isDead
    const isFinished = item.isFinished
    const isMinor = item.isMinor
    const label = item.displayName
    const nodeKind = 'document' as const
    const tagId = input.tagId
    const treeOrderNumber = item.treeOrderNumber
    const worldColor = input.worldColor
    const worldId = input.worldId
    return {
      children,
      childrenLoaded: true,
      documentBackgroundColor,
      documentId,
      documentTextColor,
      groupId: null,
      hasChildren: false,
      icon,
      id,
      isCategory,
      isDead,
      isFinished,
      isMinor,
      label,
      nodeKind,
      placementId: null,
      tagId,
      treeOrderNumber,
      worldColor,
      worldId
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
