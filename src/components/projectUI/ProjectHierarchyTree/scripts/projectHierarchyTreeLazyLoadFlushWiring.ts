import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { publishProjectHierarchyTreeLazyLoadRevision } from './projectHierarchyTreeLazyLoadPublishWiring'
import { mergeLoadedChildrenIntoNode } from './projectHierarchyTreeMergeLoadedChildrenWiring'

type T_projectHierarchyTreeLazyLoadRevisionState = {
  deferredTreeRevisionPublishPending: boolean
  stagedLoadedChildren: Map<string, I_faProjectHierarchyTreeHeTreeNode[]> | null
}

export function commitProjectHierarchyTreeStagedLoadedChildren (deps: {
  revisionState: T_projectHierarchyTreeLazyLoadRevisionState
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): boolean {
  if (
    deps.revisionState.stagedLoadedChildren === null ||
    deps.revisionState.stagedLoadedChildren.size === 0
  ) {
    return false
  }
  // Merge into existing node objects. Do not clone/replace — he-tree keeps those
  // object refs; replacing them makes openNodeAndParents miss stats (opened:false).
  for (const [nodeId, children] of deps.revisionState.stagedLoadedChildren) {
    mergeLoadedChildrenIntoNode(deps.treeData.value, nodeId, children)
  }
  deps.revisionState.stagedLoadedChildren = null
  deps.revisionState.deferredTreeRevisionPublishPending = true
  return true
}

export async function flushProjectHierarchyTreeStagedLoadedChildren (deps: {
  publishDeps: {
    nextTick: () => Promise<void>
    onAfterTreeRevisionPublished: () => void | Promise<void>
    suppressTreeEmit: Ref<boolean>
    treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  }
  revisionState: T_projectHierarchyTreeLazyLoadRevisionState
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<boolean> {
  const committed = commitProjectHierarchyTreeStagedLoadedChildren({
    revisionState: deps.revisionState,
    treeData: deps.treeData
  })
  if (!committed && !deps.revisionState.deferredTreeRevisionPublishPending) {
    return false
  }
  deps.revisionState.deferredTreeRevisionPublishPending = false
  // In-place child merge alone does not update he-tree stats. Shallow root slice
  // notifies Vue/he-tree while keeping node object identity (no clone/replace).
  // Soft resync still skips remount / full reapplyHeTreeOpenState (blink source).
  await publishProjectHierarchyTreeLazyLoadRevision(
    deps.publishDeps,
    'document',
    'deferred-batch'
  )
  return true
}
