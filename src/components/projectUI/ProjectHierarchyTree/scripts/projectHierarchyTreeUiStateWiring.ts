import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  applyPersistedProjectHierarchyTreeOpenNodeIds,
  collectProjectHierarchyTreePersistedExpandedNodeIds
} from '../functions/projectHierarchyTreePersistedOpenNodeIds'
import {
  mergeProjectHierarchyTreePlacementExpandNodeIds,
  resolveDefaultProjectHierarchyTreeExpandedNodeIds,
  shouldRunProjectHierarchyTreePlacementExpandMerge
} from '../functions/projectHierarchyTreeDefaultExpand'
import {
  collectExpandedNodeIdsFromTree,
  findProjectHierarchyTreeNodeById
} from '../functions/projectHierarchyTreeExpandState'
import { shouldPersistProjectHierarchyTreeRestoredExpandedNodeIds } from '../functions/projectHierarchyTreeWorldsLayoutExpandSnapshot'
import { tryOpenHeTreeNodeAndParents } from './projectHierarchyTreeHeTreeOpenSafeWiring'
import { reapplyProjectHierarchyTreeLatentDescendantExpandState } from './projectHierarchyTreeLatentExpandReapplyWiring'
import { resolveProjectHierarchyTreeScrollContainer } from '../functions/projectHierarchyTreeScrollContainer'

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

/**
 * Re-syncs he-tree row open state from openNodeIds after a lazy-load tree revision publish.
 */
export function reapplyProjectHierarchyTreeHeTreeOpenState (deps: {
  getTreeRef: () => T_treeRef
  openNodeIds: Ref<Set<string>>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const treeRef = deps.getTreeRef()
  if (treeRef === null) {
    return
  }
  const expandedNodeIds = collectExpandedNodeIdsFromTree(
    deps.treeData.value,
    deps.openNodeIds.value
  )
  for (const nodeId of expandedNodeIds) {
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node === null) {
      continue
    }
    tryOpenHeTreeNodeAndParents({
      node,
      treeRef
    })
  }
}

export async function restoreProjectHierarchyTreeUiState (deps: {
  getExpandedNodeIds: () => string[]
  getScrollTopPx: () => number
  getTreeRef: () => T_treeRef
  getTreeScrollHost: () => HTMLElement | null
  getWorlds: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeWorkspaceWorld[]
  loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
  nextTick: () => Promise<void>
  onExpandedNodeIdsChange: (expandedNodeIds: string[]) => void
  openNodeIds: Ref<Set<string>>
  requestAnimationFrame: (callback: () => void) => number
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const persistedExpandedNodeIds = deps.getExpandedNodeIds()
  const worlds = deps.getWorlds()
  const baseExpandedNodeIds = persistedExpandedNodeIds.length > 0
    ? persistedExpandedNodeIds
    : resolveDefaultProjectHierarchyTreeExpandedNodeIds(worlds)
  const expandedNodeIds = shouldRunProjectHierarchyTreePlacementExpandMerge(
    persistedExpandedNodeIds,
    worlds
  )
    ? mergeProjectHierarchyTreePlacementExpandNodeIds(baseExpandedNodeIds, worlds)
    : baseExpandedNodeIds
  const pruned = applyPersistedProjectHierarchyTreeOpenNodeIds(
    deps.treeData.value,
    expandedNodeIds
  )
  deps.openNodeIds.value = new Set(pruned)
  const expandedNodeIdsForPersist = collectProjectHierarchyTreePersistedExpandedNodeIds(
    deps.treeData.value,
    deps.openNodeIds.value
  )
  if (shouldPersistProjectHierarchyTreeRestoredExpandedNodeIds({
    intendedExpandedNodeIds: expandedNodeIds,
    restoredExpandedNodeIds: expandedNodeIdsForPersist,
    treeNodeCount: deps.treeData.value.length
  })) {
    deps.onExpandedNodeIdsChange(expandedNodeIdsForPersist)
  }

  const treeRef = deps.getTreeRef()
  await reapplyProjectHierarchyTreeLatentDescendantExpandState({
    getTreeRef: deps.getTreeRef,
    loadChildrenAlongRevealPath: deps.loadChildrenAlongRevealPath,
    openNodeIds: deps.openNodeIds,
    treeData: deps.treeData
  })

  if (treeRef === null) {
    return
  }

  await deps.nextTick()
  deps.requestAnimationFrame(() => {
    const scrollContainer = resolveProjectHierarchyTreeScrollContainer(deps.getTreeScrollHost())
    if (scrollContainer !== null) {
      scrollContainer.scrollTop = deps.getScrollTopPx()
    }
  })
}

export async function revealProjectHierarchyTreePendingPath (deps: {
  getPendingRevealPath: () => string[]
  getTreeRef: () => T_treeRef
  getTreeScrollHost: () => HTMLElement | null
  loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
  markNodeOpen: (nodeId: string) => void
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
  runDeferredLazyLoadBatch?: (runBatch: () => Promise<void>) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const path = deps.getPendingRevealPath()
  if (path.length === 0) {
    return
  }
  const treeRef = deps.getTreeRef()
  if (treeRef === null) {
    return
  }

  async function loadRevealPathNodes (): Promise<void> {
    for (const nodeId of path) {
      await deps.loadChildrenAlongRevealPath([nodeId])
      const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
      if (node === null) {
        continue
      }
      deps.markNodeOpen(nodeId)
    }
  }

  function openRevealPathInHeTree (treeRef: NonNullable<T_treeRef>): void {
    for (const nodeId of path) {
      const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
      if (node === null) {
        continue
      }
      treeRef.openNodeAndParents(node)
    }
  }

  if (deps.runDeferredLazyLoadBatch !== undefined) {
    await deps.runDeferredLazyLoadBatch(loadRevealPathNodes)
  } else {
    await loadRevealPathNodes()
    openRevealPathInHeTree(treeRef)
  }

  const focusId = path[path.length - 1]
  if (focusId !== undefined) {
    await deps.nextTick()
    deps.requestAnimationFrame(() => {
      const scrollContainer = resolveProjectHierarchyTreeScrollContainer(deps.getTreeScrollHost())
      const row = scrollContainer?.querySelector(`[data-test-hierarchy-node-id="${focusId}"]`)
      if (row instanceof HTMLElement) {
        row.scrollIntoView({
          block: 'nearest'
        })
      }
    })
  }
}

export {
  markProjectHierarchyTreeNodeClosed,
  markProjectHierarchyTreeNodeOpen,
  syncProjectHierarchyTreeOpenSetToPersist
} from './projectHierarchyTreeNodeOpenCloseStateWiring'
