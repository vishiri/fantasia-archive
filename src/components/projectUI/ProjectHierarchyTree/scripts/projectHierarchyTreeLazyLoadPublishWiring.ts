import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { publishProjectHierarchyTreeRootRevision } from '../functions/projectHierarchyTreeExpandState'

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
  _nodeId: string
): Promise<void> {
  deps.suppressTreeEmit.value = true
  try {
    deps.treeData.value = publishProjectHierarchyTreeRootRevision(deps.treeData.value)
    await notifyAfterProjectHierarchyTreeRevisionPublished(deps)
  } finally {
    deps.suppressTreeEmit.value = false
  }
}
