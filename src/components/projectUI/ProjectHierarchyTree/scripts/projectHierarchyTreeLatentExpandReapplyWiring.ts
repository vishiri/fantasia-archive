import type { Ref } from 'vue'
import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { collectExpandedNodeIdsFromTree, collectProjectHierarchyTreeAncestorIds, findProjectHierarchyTreeNodeById, needsProjectHierarchyTreeLazyLoadBeforeOpen, collectProjectHierarchyTreeDescendantIds, evictCollapsedNodeChildren, evictProjectHierarchyTreeCollapsedSubtreeChildren, shouldProjectHierarchyTreePreserveDescendantOpenIdsOnCollapse } from '../functions/projectHierarchyTreeExpandState'
import { shouldReloadProjectHierarchyTreeNodeChildren } from '../functions/projectHierarchyTreeLazyLoadChildReload'
import { compareProjectHierarchyTreeShallowFirstLazyLoadRows, shouldContinueLatentExpandAfterStallRetry } from '../functions/projectHierarchyTreeLatentExpandOrder'
import { collectProjectHierarchyTreeLatentDocumentOpenNodeIds, collectProjectHierarchyTreePersistedExpandedNodeIds } from '../functions/projectHierarchyTreePersistedOpenNodeIds'
import { tryOpenHeTreeNodeAndParents } from './projectHierarchyTreeHeTreeHelpersWiring'
import { collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet } from '../functions/projectHierarchyTreeBulkExpandCollapse'

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

function collectShallowFirstOpenNodeIdsNeedingLazyLoad (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>
): string[] {
  const needingLoad: { depth: number, nodeId: string }[] = []
  for (const nodeId of openNodeIds) {
    const node = findProjectHierarchyTreeNodeById(treeNodes, nodeId)
    if (node === null) {
      continue
    }
    if (!shouldReloadProjectHierarchyTreeNodeChildren(node)) {
      continue
    }
    const ancestorDepth = collectProjectHierarchyTreeAncestorIds(treeNodes, nodeId)?.length ?? 0
    needingLoad.push({
      depth: ancestorDepth,
      nodeId
    })
  }
  needingLoad.sort(compareProjectHierarchyTreeShallowFirstLazyLoadRows)
  return needingLoad.map((row) => row.nodeId)
}

function reapplyProjectHierarchyTreeHeTreeOpenStateInline (deps: {
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

async function commitLatentStagedChildren (
  commitStaged: (() => boolean) | (() => void | Promise<void>) | undefined
): Promise<void> {
  if (commitStaged === undefined) {
    return
  }
  await commitStaged()
}

/**
 * Reapplies remembered descendant expand ids after a parent row reopens.
 */
export async function reapplyProjectHierarchyTreeLatentDescendantExpandState (deps: {
  commitStagedLoadedChildren?: () => boolean
  flushDeferredTreeRevisionPublish?: () => void | Promise<void>
  getTreeRef: () => T_treeRef
  loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
  openNodeIds: Ref<Set<string>>
  reapplyHeTreeOpenAfterEachPass?: boolean
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const reapplyHeTreeOpenAfterEachPass = deps.reapplyHeTreeOpenAfterEachPass ?? true
  const commitStaged = deps.commitStagedLoadedChildren ?? deps.flushDeferredTreeRevisionPublish
  const maxPasses = deps.openNodeIds.value.size + 2
  let previousStallKey = ''
  for (let pass = 0; pass < maxPasses; pass++) {
    const shallowFirstNeedingLoad = collectShallowFirstOpenNodeIdsNeedingLazyLoad(
      deps.treeData.value,
      deps.openNodeIds.value
    )
    const pendingLatentDocumentIds = collectProjectHierarchyTreeLatentDocumentOpenNodeIds(
      deps.treeData.value,
      deps.openNodeIds.value
    )
    const stallKey = [
      ...shallowFirstNeedingLoad,
      ...pendingLatentDocumentIds
    ].join('|')
    if (stallKey === previousStallKey && stallKey !== '') {
      await commitLatentStagedChildren(commitStaged)
      const retryStallKey = [
        ...collectShallowFirstOpenNodeIdsNeedingLazyLoad(deps.treeData.value, deps.openNodeIds.value),
        ...collectProjectHierarchyTreeLatentDocumentOpenNodeIds(deps.treeData.value, deps.openNodeIds.value)
      ].join('|')
      if (shouldContinueLatentExpandAfterStallRetry(stallKey, retryStallKey)) {
        previousStallKey = ''
        continue
      }
      break
    }
    previousStallKey = stallKey

    for (const nodeId of deps.openNodeIds.value) {
      const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
      if (node !== null && needsProjectHierarchyTreeLazyLoadBeforeOpen(node)) {
        await deps.loadChildrenAlongRevealPath([nodeId])
      }
    }
    for (const nodeId of shallowFirstNeedingLoad) {
      const ancestors = collectProjectHierarchyTreeAncestorIds(deps.treeData.value, nodeId) ?? []
      await deps.loadChildrenAlongRevealPath([...ancestors, nodeId])
    }
    for (const nodeId of collectExpandedNodeIdsFromTree(deps.treeData.value, deps.openNodeIds.value)) {
      await deps.loadChildrenAlongRevealPath([nodeId])
    }
    await commitLatentStagedChildren(commitStaged)
    if (reapplyHeTreeOpenAfterEachPass) {
      reapplyProjectHierarchyTreeHeTreeOpenStateInline(deps)
    }
    const stillNeedsLazyLoad = collectShallowFirstOpenNodeIdsNeedingLazyLoad(
      deps.treeData.value,
      deps.openNodeIds.value
    ).length > 0
    if (pendingLatentDocumentIds.length === 0 && !stillNeedsLazyLoad) {
      break
    }
  }
}

export function syncProjectHierarchyTreeOpenSetToPersist (deps: {
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const expandedNodeIds = collectProjectHierarchyTreePersistedExpandedNodeIds(
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
  forceSublevelCollapseInTree?: boolean
  node: I_faProjectHierarchyTreeHeTreeNode
  nodeId: string
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const forceSublevelCollapseInTree = deps.forceSublevelCollapseInTree === true
  const canonicalNode =
    findProjectHierarchyTreeNodeById(deps.treeData.value, deps.nodeId) ?? deps.node
  const next = new Set(deps.openNodeIds.value)
  if (forceSublevelCollapseInTree) {
    const pruneSet = collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet(
      deps.treeData.value,
      deps.openNodeIds.value,
      deps.nodeId
    )
    for (const pruneId of pruneSet) {
      next.delete(pruneId)
    }
    deps.openNodeIds.value = next
    evictProjectHierarchyTreeCollapsedSubtreeChildren(canonicalNode)
  } else {
    next.delete(deps.nodeId)
    if (!shouldProjectHierarchyTreePreserveDescendantOpenIdsOnCollapse(canonicalNode.nodeKind)) {
      for (const descendantId of collectProjectHierarchyTreeDescendantIds(canonicalNode)) {
        next.delete(descendantId)
      }
    }
    deps.openNodeIds.value = next
    evictCollapsedNodeChildren(canonicalNode)
  }
  syncProjectHierarchyTreeOpenSetToPersist({
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    treeData: deps.treeData
  })
}
