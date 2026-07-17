import type { Ref } from 'vue'

import { PROJECT_HIERARCHY_TREE_OPEN_ICON_ROTATE_TRANSITION_MS } from '../functions/projectHierarchyTreeConstants'
import { resolveProjectHierarchyTreeOpenIconExpanded } from '../functions/projectHierarchyTreeOpenIconExpandedVisual'

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
