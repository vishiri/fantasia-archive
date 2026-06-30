import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { publishProjectHierarchyTreeRootRevision } from '../functions/projectHierarchyTreeExpandState'
import { logProjectHierarchyTreeDebugSession } from './projectHierarchyTreeDebugSessionLogWiring'

type T_lazyLoadPublishDeps = {
  nextTick: () => Promise<void>
  onAfterTreeRevisionPublished: () => void | Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

async function notifyAfterProjectHierarchyTreeRevisionPublished (
  deps: T_lazyLoadPublishDeps,
  nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
  nodeId: string
): Promise<void> {
  logProjectHierarchyTreeDebugSession({
    data: {
      nodeId,
      nodeKind
    },
    hypothesisId: 'D1',
    location: 'projectHierarchyTreeLazyLoadPublishWiring.ts:publishTreeRevision',
    message: 'lazy-load tree revision published',
    runId: 'doc-nested-open'
  })
  await deps.nextTick()
  await deps.onAfterTreeRevisionPublished()
}

export async function publishProjectHierarchyTreeLazyLoadRevision (
  deps: T_lazyLoadPublishDeps,
  nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
  nodeId: string
): Promise<void> {
  deps.suppressTreeEmit.value = true
  try {
    deps.treeData.value = publishProjectHierarchyTreeRootRevision(deps.treeData.value)
    await notifyAfterProjectHierarchyTreeRevisionPublished(deps, nodeKind, nodeId)
  } finally {
    deps.suppressTreeEmit.value = false
  }
}
