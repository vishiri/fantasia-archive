import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeTagSettings,
  I_faProjectHierarchyTreeWorkspaceTag,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  mapProjectHierarchyTreeTagToNode,
  mapProjectHierarchyTreeTagWrapperNode,
  mergeProjectHierarchyTreeWorldChildrenWithTags,
  resolveProjectHierarchyTreeTagWrapperNodeId,
  sortProjectHierarchyTreeWorkspaceTagsAlphabetically
} from '../functions/projectHierarchyTreeTagNodes'

type T_lazyPlaceholderApi = {
  resolveLazyChildren: (parent: I_faProjectHierarchyTreeHeTreeNode) => I_faProjectHierarchyTreeHeTreeNode[]
  syncProjectHierarchyTreeNodeLazyChildren: (node: I_faProjectHierarchyTreeHeTreeNode) => void
}

/**
 * Patches one existing tag row from layout tag data; preserves loaded children.
 */
function patchProjectHierarchyTreeTagNodeFromLayoutTag (
  tagNode: I_faProjectHierarchyTreeHeTreeNode,
  tag: I_faProjectHierarchyTreeWorkspaceTag,
  lazyPlaceholderApi: T_lazyPlaceholderApi
): void {
  tagNode.label = tag.name
  tagNode.categoryCount = tag.categoryCount
  tagNode.documentCount = tag.documentCount
  tagNode.hasChildren = (tag.documentCount + tag.categoryCount) > 0
  tagNode.tagId = tag.id
  lazyPlaceholderApi.syncProjectHierarchyTreeNodeLazyChildren(tagNode)
}

/**
 * Builds next tag-row list, reusing existing nodes by id when present.
 */
function resolveProjectHierarchyTreeSyncedTagNodes (input: {
  existingTagNodesById: Map<string, I_faProjectHierarchyTreeHeTreeNode>
  lazyPlaceholderApi: T_lazyPlaceholderApi
  tags: readonly I_faProjectHierarchyTreeWorkspaceTag[]
  world: Pick<I_faProjectHierarchyTreeWorkspaceWorld, 'color' | 'id'>
}): I_faProjectHierarchyTreeHeTreeNode[] {
  return sortProjectHierarchyTreeWorkspaceTagsAlphabetically(input.tags).map((tag) => {
    const existing = input.existingTagNodesById.get(tag.id)
    if (existing !== undefined) {
      patchProjectHierarchyTreeTagNodeFromLayoutTag(existing, tag, input.lazyPlaceholderApi)
      return existing
    }
    return mapProjectHierarchyTreeTagToNode({
      lazyPlaceholderApi: input.lazyPlaceholderApi,
      tag,
      world: input.world
    })
  })
}

function collectProjectHierarchyTreeExistingTagNodesById (
  nodes: readonly I_faProjectHierarchyTreeHeTreeNode[]
): Map<string, I_faProjectHierarchyTreeHeTreeNode> {
  const tagNodesById = new Map<string, I_faProjectHierarchyTreeHeTreeNode>()
  for (const node of nodes) {
    if (node.nodeKind === 'tag') {
      tagNodesById.set(node.id, node)
      continue
    }
    if (node.nodeKind !== 'tagWrapper') {
      continue
    }
    for (const child of node.children) {
      if (child.nodeKind === 'tag') {
        tagNodesById.set(child.id, child)
      }
    }
  }
  return tagNodesById
}

function splitProjectHierarchyTreeWorldStructuralChildren (
  worldNode: I_faProjectHierarchyTreeHeTreeNode
): I_faProjectHierarchyTreeHeTreeNode[] {
  return worldNode.children.filter((child) => {
    return child.nodeKind === 'group' || child.nodeKind === 'templatePlacement'
  })
}

/**
 * Syncs tag / compact-wrapper rows on an existing world skeleton node.
 * Adds/removes/reorders tags in place so membership changes skip full tree rebuild.
 */
export function patchProjectHierarchyTreeTagBranchLabelsInPlace (input: {
  lazyPlaceholderApi: T_lazyPlaceholderApi
  resolveTagsLabel: () => string
  tagSettings: I_faProjectHierarchyTreeTagSettings
  world: I_faProjectHierarchyTreeWorkspaceWorld
  worldNode: I_faProjectHierarchyTreeHeTreeNode
}): void {
  const structuralChildren = splitProjectHierarchyTreeWorldStructuralChildren(input.worldNode)
  if (input.tagSettings.noTags) {
    input.worldNode.children = structuralChildren
    return
  }
  const tags = input.world.tags ?? []
  if (tags.length === 0) {
    input.worldNode.children = structuralChildren
    return
  }
  const existingTagNodesById = collectProjectHierarchyTreeExistingTagNodesById(
    input.worldNode.children
  )
  const syncedTagNodes = resolveProjectHierarchyTreeSyncedTagNodes({
    existingTagNodesById,
    lazyPlaceholderApi: input.lazyPlaceholderApi,
    tags,
    world: input.world
  })
  let tagBranchNodes: I_faProjectHierarchyTreeHeTreeNode[]
  if (input.tagSettings.compactTags) {
    const wrapperId = resolveProjectHierarchyTreeTagWrapperNodeId(input.world.id)
    const existingWrapper = input.worldNode.children.find((child) => {
      return child.nodeKind === 'tagWrapper' && child.id === wrapperId
    })
    const wrapperNode = existingWrapper ?? mapProjectHierarchyTreeTagWrapperNode({
      lazyPlaceholderApi: input.lazyPlaceholderApi,
      tags: [],
      tagsLabel: input.resolveTagsLabel(),
      world: input.world
    })
    wrapperNode.label = input.resolveTagsLabel()
    wrapperNode.children = syncedTagNodes
    wrapperNode.childrenLoaded = true
    wrapperNode.hasChildren = syncedTagNodes.length > 0
    tagBranchNodes = [wrapperNode]
  } else {
    tagBranchNodes = syncedTagNodes
  }
  input.worldNode.children = mergeProjectHierarchyTreeWorldChildrenWithTags({
    structuralChildren,
    tagBranchNodes,
    tagsAtTop: input.tagSettings.tagsAtTop
  })
}
