import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  applyExpandedNodeIdsToTree,
  findProjectHierarchyTreeNodeById,
  pruneProjectHierarchyTreeExpandedNodeIdsToAncestors
} from '../functions/projectHierarchyTreeExpandState'
import {
  collectProjectHierarchyTreeLazyLoadIdsAlongExpandedPaths,
  sortProjectHierarchyTreeExpandedNodeIdsForRestore
} from './projectHierarchyTreeExpandedRestoreOrder'
import { logProjectHierarchyTreeDebugSession } from './projectHierarchyTreeDebugSessionLogWiring'

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

async function applyProjectHierarchyTreeExpandedOpenState (deps: {
  expandedNodeIds: string[]
  getTreeRef: () => T_treeRef
  nextTick: () => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const treeRef = deps.getTreeRef()
  if (treeRef === null) {
    return
  }
  treeRef.closeAll()
  await deps.nextTick()
  for (const nodeId of deps.expandedNodeIds) {
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node === null) {
      continue
    }
    treeRef.openNodeAndParents(node)
  }
}

export async function restoreProjectHierarchyTreeExpandedSnapshot (deps: {
  expandedNodeIds: string[]
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  getTreeRef: () => T_treeRef
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  nextTick: () => Promise<void>
  onExpandedNodeIdsChange: (expandedNodeIds: string[]) => void
  openNodeIds: Ref<Set<string>>
  requestAnimationFrame: (callback: () => void) => number
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const pruned = pruneProjectHierarchyTreeExpandedNodeIdsToAncestors(
    deps.treeData.value,
    applyExpandedNodeIdsToTree(
      deps.treeData.value,
      deps.expandedNodeIds
    )
  )
  deps.openNodeIds.value = new Set(pruned)
  deps.onExpandedNodeIdsChange(pruned)

  const sortedExpandedNodeIds = sortProjectHierarchyTreeExpandedNodeIdsForRestore(
    deps.treeData.value,
    pruned
  )
  const lazyLoadNodeIds = collectProjectHierarchyTreeLazyLoadIdsAlongExpandedPaths(
    deps.treeData.value,
    sortedExpandedNodeIds
  )
  for (const nodeId of lazyLoadNodeIds) {
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node === null) {
      continue
    }
    await deps.loadChildrenForNode(node)
  }
  await deps.flushDeferredTreeRevisionPublish()

  const treeRef = deps.getTreeRef()
  logProjectHierarchyTreeDebugSession({
    data: {
      inputExpandedNodeIds: deps.expandedNodeIds,
      pruned,
      treeRefPresent: treeRef !== null
    },
    hypothesisId: 'H3',
    location: 'projectHierarchyTreeExpandedSnapshotWiring.ts:restore',
    message: 'snapshot restore pruned ids'
  })
  if (treeRef === null) {
    return
  }

  const openStateDeps = {
    expandedNodeIds: sortedExpandedNodeIds,
    getTreeRef: deps.getTreeRef,
    nextTick: deps.nextTick,
    treeData: deps.treeData
  }
  await applyProjectHierarchyTreeExpandedOpenState(openStateDeps)
  await deps.nextTick()
  await new Promise<void>((resolve) => {
    deps.requestAnimationFrame(() => {
      resolve()
    })
  })
  await applyProjectHierarchyTreeExpandedOpenState(openStateDeps)
}
