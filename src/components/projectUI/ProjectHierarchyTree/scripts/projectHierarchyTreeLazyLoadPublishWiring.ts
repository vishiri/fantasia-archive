import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  cloneProjectHierarchyTreeLoadedNodeForPublish,
  replaceProjectHierarchyTreeNodeByIdInPlace
} from '../functions/projectHierarchyTreeCloneLoadedNodeForPublish'
import {
  findProjectHierarchyTreeNodeById,
  publishProjectHierarchyTreeRootRevision
} from '../functions/projectHierarchyTreeExpandState'

type T_lazyLoadPublishDeps = {
  nextTick: () => Promise<void>
  onAfterTreeRevisionPublished: () => void | Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

async function notifyAfterProjectHierarchyTreeRevisionPublished (
  deps: T_lazyLoadPublishDeps
): Promise<void> {
  await deps.nextTick()
  await deps.onAfterTreeRevisionPublished()
}

export async function publishProjectHierarchyTreeLazyLoadRevision (
  deps: T_lazyLoadPublishDeps,
  _nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
  nodeId: string,
  options?: { skipRootRevision?: boolean }
): Promise<void> {
  deps.suppressTreeEmit.value = true
  try {
    const loadedNode = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (loadedNode !== null && loadedNode.childrenLoaded) {
      replaceProjectHierarchyTreeNodeByIdInPlace(
        deps.treeData.value,
        nodeId,
        cloneProjectHierarchyTreeLoadedNodeForPublish(loadedNode)
      )
    }
    if (options?.skipRootRevision !== true) {
      deps.treeData.value = publishProjectHierarchyTreeRootRevision(deps.treeData.value)
    }
    await notifyAfterProjectHierarchyTreeRevisionPublished(deps)
  } finally {
    deps.suppressTreeEmit.value = false
  }
}
