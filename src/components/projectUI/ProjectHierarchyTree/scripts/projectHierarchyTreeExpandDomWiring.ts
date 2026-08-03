import type { Ref } from 'vue'
import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeLiveExpandDomState
} from 'app/types/I_faProjectHierarchyTreeDomain'
import { PROJECT_HIERARCHY_TREE_OPEN_ICON_ROTATE_TRANSITION_MS } from '../functions/projectHierarchyTreeConstants'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { resolveProjectHierarchyTreeOpenIconExpanded } from '../functions/projectHierarchyTreeOpenIconExpandedVisual'

function readProjectHierarchyTreeNodeIdFromRow (row: Element): string | null {
  const nodeElement = row.querySelector('[data-test-hierarchy-node-id]')
  if (!(nodeElement instanceof HTMLElement)) {
    return null
  }
  const nodeId = nodeElement.getAttribute('data-test-hierarchy-node-id')
  if (nodeId === null || nodeId.length === 0) {
    return null
  }
  return nodeId
}

function isProjectHierarchyTreeRowVisuallyExpanded (row: Element): boolean | null {
  const openIcon = row.querySelector('[data-test-locator="projectHierarchyTree-openIcon"]')
  if (openIcon === null) {
    return null
  }
  return openIcon.classList.contains('projectHierarchyTree__openIcon--open')
}

/**
 * Resolves the hierarchy tree DOM root used for live expand reads.
 */
export function resolveProjectHierarchyTreeScrollHostForDomRead (
  treeScrollHost: HTMLElement | null
): HTMLElement | null {
  if (treeScrollHost !== null) {
    return treeScrollHost
  }
  const host = document.querySelector('[data-test-locator="projectHierarchyTree-host"]')
  return host instanceof HTMLElement ? host : null
}

/**
 * Reads which hierarchy tree rows are visually expanded or collapsed from the sidebar DOM.
 */
export function collectProjectHierarchyTreeLiveExpandStateFromDom (
  treeScrollHost: HTMLElement | null
): I_faProjectHierarchyTreeLiveExpandDomState {
  const host = resolveProjectHierarchyTreeScrollHostForDomRead(treeScrollHost)
  if (host === null) {
    return {
      collapsedVisibleNodeIds: [],
      expandedNodeIds: [],
      rowCount: 0,
      scrollHostPresent: false
    }
  }
  const searchRoot = host.querySelector('.projectHierarchyTree') ?? host
  const expandedNodeIds: string[] = []
  const collapsedVisibleNodeIds: string[] = []
  const rows = searchRoot.querySelectorAll('.projectHierarchyTree__nodeRow')
  for (const row of rows) {
    const nodeId = readProjectHierarchyTreeNodeIdFromRow(row)
    if (nodeId === null) {
      continue
    }
    const isExpanded = isProjectHierarchyTreeRowVisuallyExpanded(row)
    if (isExpanded === null) {
      continue
    }
    if (isExpanded) {
      expandedNodeIds.push(nodeId)
      continue
    }
    collapsedVisibleNodeIds.push(nodeId)
  }
  return {
    collapsedVisibleNodeIds,
    expandedNodeIds,
    rowCount: rows.length,
    scrollHostPresent: true
  }
}

/**
 * Reads expanded node ids from visible open-icon rows in the hierarchy tree DOM.
 */
export function collectProjectHierarchyTreeLiveExpandedNodeIdsFromDom (
  treeScrollHost: HTMLElement | null
): string[] {
  return collectProjectHierarchyTreeLiveExpandStateFromDom(treeScrollHost).expandedNodeIds
}

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

export async function openProjectHierarchyTreeNestParentAfterDragDrop (deps: {
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  getTreeRef: () => T_treeRef
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeOpen: (nodeId: string) => void
  nestParentDocumentId: string
  nextTick: () => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const parentNode = findProjectHierarchyTreeNodeById(
    deps.treeData.value,
    deps.nestParentDocumentId
  )
  if (parentNode === null) {
    return
  }
  await deps.loadChildrenForNode(parentNode)
  await deps.flushDeferredTreeRevisionPublish()
  deps.markNodeOpen(parentNode.id)
  const treeRef = deps.getTreeRef()
  treeRef?.openNodeAndParents(parentNode)
  await deps.nextTick()
}

export async function openProjectHierarchyTreeNodeInHeTree (deps: {
  getTreeRef: () => T_treeRef
  markNodeOpen: (nodeId: string) => void
  nextTick: () => Promise<void>
  nodeId: string
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const node = findProjectHierarchyTreeNodeById(deps.treeData.value, deps.nodeId)
  if (node === null) {
    return
  }
  deps.markNodeOpen(deps.nodeId)
  deps.getTreeRef()?.openNodeAndParents(node)
  await deps.nextTick()
}

export function createProjectHierarchyTreeOpenIconExpandAnimationWiring (deps: {
  clearTimeout: (timeoutId: number) => void
  onUnmounted: (hook: () => void) => void
  openIconRotateTransitionDurationMs?: number
  openNodeIds: Ref<Set<string>>
  ref: <T>(initial: T) => Ref<T>
  setTimeout: (handler: () => void, delayMs: number) => number
}) {
  const pendingNodeIds = deps.ref<Set<string>>(new Set())
  const clearTimerByNodeId = new Map<string, number>()
  const openIconRotateTransitionDurationMs =
    deps.openIconRotateTransitionDurationMs ?? PROJECT_HIERARCHY_TREE_OPEN_ICON_ROTATE_TRANSITION_MS

  function clearPendingTimer (nodeId: string): void {
    const timerId = clearTimerByNodeId.get(nodeId)
    if (timerId === undefined) {
      return
    }
    deps.clearTimeout(timerId)
    clearTimerByNodeId.delete(nodeId)
  }

  function removePendingNodeId (nodeId: string): void {
    if (!pendingNodeIds.value.has(nodeId)) {
      return
    }
    const next = new Set(pendingNodeIds.value)
    next.delete(nodeId)
    pendingNodeIds.value = next
  }

  function scheduleOpenIconExpandAnimation (nodeId: string): void {
    clearPendingTimer(nodeId)
    const next = new Set(pendingNodeIds.value)
    next.add(nodeId)
    pendingNodeIds.value = next
    const timerId = deps.setTimeout(() => {
      clearTimerByNodeId.delete(nodeId)
      removePendingNodeId(nodeId)
    }, openIconRotateTransitionDurationMs)
    clearTimerByNodeId.set(nodeId, timerId)
  }

  function isOpenIconExpandAnimationPending (nodeId: string): boolean {
    return pendingNodeIds.value.has(nodeId)
  }

  function isProjectHierarchyTreeOpenIconExpandedForOpenIcon (
    nodeId: string,
    statOpen: boolean
  ): boolean {
    return resolveProjectHierarchyTreeOpenIconExpanded(deps.openNodeIds.value, nodeId, statOpen)
  }

  deps.onUnmounted(() => {
    for (const nodeId of clearTimerByNodeId.keys()) {
      clearPendingTimer(nodeId)
    }
    pendingNodeIds.value = new Set()
  })

  return {
    isOpenIconExpandAnimationPending,
    isProjectHierarchyTreeOpenIconExpandedForOpenIcon,
    scheduleOpenIconExpandAnimation
  }
}
