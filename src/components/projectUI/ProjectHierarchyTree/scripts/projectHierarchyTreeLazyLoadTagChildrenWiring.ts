import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faProjectTagDocumentChild } from 'app/types/I_faProjectTagDomain'

import { isProjectHierarchyTreeAddNewDocumentNode } from '../functions/projectHierarchyTreeAddNewDocumentNodeKind'
import { PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON } from '../functions/projectHierarchyTreeConstants'
import { createMergeLoadedChildrenIntoNode } from '../functions/projectHierarchyTreeMergeLoadedChildren'
import { mapProjectHierarchyTreeDocumentsUnderTagToNodes } from '../functions/projectHierarchyTreeTagNodes'
import { resolveTrimmedIconOrDefault } from 'app/src/scripts/faIcons/faIconDisplay_manager'

const mergeLoadedChildrenIntoNode = createMergeLoadedChildrenIntoNode({
  isAddNewDocumentNode: isProjectHierarchyTreeAddNewDocumentNode
})

export async function loadProjectHierarchyTreeTagNodeChildrenIfNeeded (deps: {
  listDocumentsUnderTag?: (
    input: { tagId: string }
  ) => Promise<{ items: I_faProjectTagDocumentChild[] }>
  node: I_faProjectHierarchyTreeHeTreeNode
  publishTreeRevision: (
    nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
    nodeId: string
  ) => Promise<void>
  stageLoadedChildrenForNode?: (
    nodeId: string,
    children: I_faProjectHierarchyTreeHeTreeNode[]
  ) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<boolean> {
  const tagId = deps.node.tagId
  if (deps.node.nodeKind !== 'tag' || typeof tagId !== 'string' || tagId.length === 0) {
    return false
  }
  const listDocumentsUnderTag = deps.listDocumentsUnderTag
  if (listDocumentsUnderTag === undefined) {
    return true
  }
  const result = await listDocumentsUnderTag({ tagId })
  const children = mapProjectHierarchyTreeDocumentsUnderTagToNodes({
    items: result.items,
    resolvePlacementDisplayIcon: (icon) => {
      return resolveTrimmedIconOrDefault(icon, PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON)
    },
    tagId,
    worldColor: deps.node.worldColor,
    worldId: deps.node.worldId
  })
  if (deps.stageLoadedChildrenForNode !== undefined) {
    deps.stageLoadedChildrenForNode(deps.node.id, children)
    return true
  }
  if (mergeLoadedChildrenIntoNode(deps.treeData.value, deps.node.id, children)) {
    await deps.publishTreeRevision(deps.node.nodeKind, deps.node.id)
  }
  return true
}
