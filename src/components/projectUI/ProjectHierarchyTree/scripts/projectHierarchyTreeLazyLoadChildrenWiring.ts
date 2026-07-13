import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeListPlacementChildrenInput
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { mapHierarchyDocumentChildrenToTreeNodes } from '../functions/mapHierarchyDocumentChildrenToTreeNodes'
import { shouldReloadProjectHierarchyTreeNodeChildren } from '../functions/projectHierarchyTreeLazyLoadChildReload'
import {
  finalizeProjectHierarchyTreePlacementTopLevelChildren
} from './projectHierarchyTreeAddNewDocumentNode'
import { mergeLoadedChildrenIntoNode } from '../functions/projectHierarchyTreeMergeLoadedChildren'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

export async function refreshProjectHierarchyTreeNodeChildrenFromDatabase (deps: {
  listPlacementDocumentChildren: (
    input: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] }>
  nodeId: string
  preferredLanguageCode: T_faUserSettingsLanguageCode
  publishTreeRevision: (
    nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
    nodeId: string
  ) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const node = findProjectHierarchyTreeNodeById(deps.treeData.value, deps.nodeId)
  if (node === null) {
    return
  }
  node.childrenLoaded = false
  await loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren: deps.listPlacementDocumentChildren,
    node,
    preferredLanguageCode: deps.preferredLanguageCode,
    publishTreeRevision: deps.publishTreeRevision,
    treeData: deps.treeData
  })
}

export async function loadProjectHierarchyTreeNodeChildren (deps: {
  listPlacementDocumentChildren: (
    input: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] }>
  node: I_faProjectHierarchyTreeHeTreeNode
  preferredLanguageCode: T_faUserSettingsLanguageCode
  publishTreeRevision: (
    nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
    nodeId: string
  ) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  if (!shouldReloadProjectHierarchyTreeNodeChildren(deps.node)) {
    return
  }
  if (deps.node.nodeKind === 'templatePlacement' && deps.node.placementId !== null) {
    const result = await deps.listPlacementDocumentChildren({
      placementId: deps.node.placementId
    })
    const docChildren = mapHierarchyDocumentChildrenToTreeNodes({
      items: result.items,
      placementIcon: deps.node.icon,
      worldColor: deps.node.worldColor,
      worldId: deps.node.worldId
    })
    const children = finalizeProjectHierarchyTreePlacementTopLevelChildren({
      children: docChildren,
      placement: deps.node,
      preferredLanguageCode: deps.preferredLanguageCode
    })
    if (mergeLoadedChildrenIntoNode(deps.treeData.value, deps.node.id, children)) {
      await deps.publishTreeRevision(deps.node.nodeKind, deps.node.id)
    }
    return
  }
  if (!deps.node.hasChildren) {
    return
  }
  if (
    deps.node.nodeKind === 'document' &&
    deps.node.placementId !== null &&
    deps.node.documentId !== null
  ) {
    const result = await deps.listPlacementDocumentChildren({
      parentDocumentId: deps.node.documentId,
      placementId: deps.node.placementId
    })
    const children = mapHierarchyDocumentChildrenToTreeNodes({
      items: result.items,
      placementIcon: deps.node.icon,
      worldColor: deps.node.worldColor,
      worldId: deps.node.worldId
    })
    if (mergeLoadedChildrenIntoNode(deps.treeData.value, deps.node.id, children)) {
      await deps.publishTreeRevision(deps.node.nodeKind, deps.node.id)
    }
  }
}

function findProjectHierarchyTreeNodeById (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  nodeId: string
): I_faProjectHierarchyTreeHeTreeNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node
    }
    const nested = findProjectHierarchyTreeNodeById(node.children, nodeId)
    if (nested !== null) {
      return nested
    }
  }
  return null
}
