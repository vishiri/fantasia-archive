import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  mergeProjectHierarchyTreePlacementExpandNodeIds,
  resolveDefaultProjectHierarchyTreeExpandedNodeIds,
  shouldRunProjectHierarchyTreePlacementExpandMerge
} from '../functions/projectHierarchyTreeDefaultExpand'
import {
  applyExpandedNodeIdsToTree,
  collectExpandedNodeIdsFromTree,
  collectProjectHierarchyTreeAncestorIds,
  collectProjectHierarchyTreeDescendantIds,
  evictCollapsedNodeChildren,
  findProjectHierarchyTreeNodeById,
  pruneProjectHierarchyTreeExpandedNodeIdsToAncestors
} from '../functions/projectHierarchyTreeExpandState'
import { resolveProjectHierarchyTreeScrollContainer } from '../functions/projectHierarchyTreeScrollContainer'
import { logProjectHierarchyTreeDebugSession } from './projectHierarchyTreeDebugSessionLogWiring'

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
  logProjectHierarchyTreeDebugSession({
    data: {
      expandedNodeIds,
      openNodeIds: [...deps.openNodeIds.value]
    },
    hypothesisId: 'P1',
    location: 'projectHierarchyTreeUiStateWiring.ts:reapplyHeTreeOpenState',
    message: 'reapply he-tree open rows after lazy-load publish',
    runId: 'doc-nested-open'
  })
  for (const nodeId of expandedNodeIds) {
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node === null) {
      continue
    }
    treeRef.openNodeAndParents(node)
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
  const pruned = pruneProjectHierarchyTreeExpandedNodeIdsToAncestors(
    deps.treeData.value,
    applyExpandedNodeIdsToTree(
      deps.treeData.value,
      expandedNodeIds
    )
  )
  logProjectHierarchyTreeDebugSession({
    data: {
      expandedNodeIds,
      mergeRan: shouldRunProjectHierarchyTreePlacementExpandMerge(
        persistedExpandedNodeIds,
        worlds
      ),
      persistedExpandedNodeIds,
      pruned
    },
    hypothesisId: 'H2-H4-H5',
    location: 'projectHierarchyTreeUiStateWiring.ts:restoreUiState',
    message: 'full restore from store'
  })
  deps.openNodeIds.value = new Set(pruned)
  deps.onExpandedNodeIdsChange(pruned)

  const treeRef = deps.getTreeRef()
  for (const nodeId of pruned) {
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node === null) {
      continue
    }
    await deps.loadChildrenAlongRevealPath([nodeId])
    treeRef?.openNodeAndParents(node)
  }

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

  for (const nodeId of path) {
    await deps.loadChildrenAlongRevealPath([nodeId])
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node === null) {
      continue
    }
    treeRef.openNodeAndParents(node)
    deps.markNodeOpen(nodeId)
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

export function attachProjectHierarchyTreeScrollPersist (deps: {
  getTreeScrollHost: () => HTMLElement | null
  queuePersistScrollTopPx: (scrollTopPx: number) => void
}): () => void {
  const scrollContainer = resolveProjectHierarchyTreeScrollContainer(deps.getTreeScrollHost())
  if (scrollContainer === null) {
    return () => undefined
  }
  const onScroll = (): void => {
    deps.queuePersistScrollTopPx(scrollContainer.scrollTop)
  }
  scrollContainer.addEventListener('scroll', onScroll, {
    passive: true
  })
  return () => {
    scrollContainer.removeEventListener('scroll', onScroll)
  }
}

export function syncProjectHierarchyTreeOpenSetToPersist (deps: {
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const expandedNodeIds = collectExpandedNodeIdsFromTree(
    deps.treeData.value,
    deps.openNodeIds.value
  )
  deps.queuePersistExpandedNodeIds(expandedNodeIds)
}

export function markProjectHierarchyTreeNodeOpen (deps: {
  nodeId: string
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const next = new Set(deps.openNodeIds.value)
  const ancestors = collectProjectHierarchyTreeAncestorIds(deps.treeData.value, deps.nodeId) ?? []
  for (const ancestorId of ancestors) {
    next.add(ancestorId)
  }
  next.add(deps.nodeId)
  deps.openNodeIds.value = next
  syncProjectHierarchyTreeOpenSetToPersist({
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    treeData: deps.treeData
  })
}

export function markProjectHierarchyTreeNodeClosed (deps: {
  node: I_faProjectHierarchyTreeHeTreeNode
  nodeId: string
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const next = new Set(deps.openNodeIds.value)
  next.delete(deps.nodeId)
  for (const descendantId of collectProjectHierarchyTreeDescendantIds(deps.node)) {
    next.delete(descendantId)
  }
  deps.openNodeIds.value = next
  evictCollapsedNodeChildren(deps.node)
  syncProjectHierarchyTreeOpenSetToPersist({
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    treeData: deps.treeData
  })
  logProjectHierarchyTreeDebugSession({
    data: {
      nodeId: deps.nodeId,
      nodeKind: deps.node.nodeKind,
      openNodeIdsAfter: [...deps.openNodeIds.value]
    },
    hypothesisId: 'H1',
    location: 'projectHierarchyTreeUiStateWiring.ts:markNodeClosed',
    message: 'node collapsed'
  })
}
