import { ref, type Ref } from 'vue'
import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import {
  findProjectHierarchyTreeNodeById,
  publishProjectHierarchyTreeRootRevision
} from '../functions/projectHierarchyTreeExpandState'
import { reapplyProjectHierarchyTreeLatentDescendantExpandState } from './projectHierarchyTreeLatentExpandReapplyWiring'
import { reapplyProjectHierarchyTreeHeTreeOpenState } from './projectHierarchyTreeUiStateWiring'

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

function createLoadChildrenAlongRevealPath (deps: {
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): (nodeIds: string[]) => Promise<void> {
  return async (nodeIds: string[]) => {
    for (const nodeId of nodeIds) {
      const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
      if (node === null) {
        continue
      }
      await deps.loadChildrenForNode(node)
    }
  }
}

async function reapplyExpandedSnapshotToHeTree (deps: {
  getTreeRef: () => T_treeRef
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  deps.treeData.value = publishProjectHierarchyTreeRootRevision(deps.treeData.value)
  await deps.nextTick()
  reapplyProjectHierarchyTreeHeTreeOpenState({
    getTreeRef: deps.getTreeRef,
    openNodeIds: deps.openNodeIds,
    treeData: deps.treeData
  })
}

/**
 * Loads latent expand children (deferred publish), then one he-tree remount/open.
 * Uses a shadow open set for loads so live openNodeIds stay icon-safe until children ready.
 */
export async function loadAndReapplyExpandedSnapshotAfterOpenSet (deps: {
  commitStagedLoadedChildren: () => boolean
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  fullOpenNodeIds: readonly string[]
  getTreeRef: () => T_treeRef
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  runDeferredLazyLoadBatch: (
    runBatch: () => Promise<void>,
    options?: { skipReapplyHeTreeOpenState?: boolean }
  ) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const loadChildrenAlongRevealPath = createLoadChildrenAlongRevealPath({
    loadChildrenForNode: deps.loadChildrenForNode,
    treeData: deps.treeData
  })
  const loadOpenNodeIds = ref(new Set(deps.fullOpenNodeIds))
  await deps.runDeferredLazyLoadBatch(async () => {
    await reapplyProjectHierarchyTreeLatentDescendantExpandState({
      commitStagedLoadedChildren: deps.commitStagedLoadedChildren,
      getTreeRef: deps.getTreeRef,
      loadChildrenAlongRevealPath,
      openNodeIds: loadOpenNodeIds,
      reapplyHeTreeOpenAfterEachPass: false,
      treeData: deps.treeData
    })
  }, { skipReapplyHeTreeOpenState: true })
  await deps.flushDeferredTreeRevisionPublish()
  deps.openNodeIds.value = new Set(deps.fullOpenNodeIds)
  if (deps.getTreeRef() === null) {
    return
  }
  await reapplyExpandedSnapshotToHeTree({
    getTreeRef: deps.getTreeRef,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    treeData: deps.treeData
  })
}
