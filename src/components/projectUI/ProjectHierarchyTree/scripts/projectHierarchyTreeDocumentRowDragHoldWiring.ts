import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import { bindProjectHierarchyTreeDocumentRowDragHoldDragStartCapture } from './projectHierarchyTreeDocumentRowDragHoldBindWiring'
import { createProjectHierarchyTreeDocumentRowDragHoldSession } from './projectHierarchyTreeDocumentRowDragHoldSessionWiring'

type T_documentRowDragHoldWiringDeps = {
  dragHandleClassName: string
  holdDelayMs: number
  onAllowedDocumentRowDragStart: () => void
  onUnmounted: (hook: () => void) => void
  treeScrollHostRef: Ref<HTMLElement | null>
  watch: typeof watchFn
  windowClearTimeout: (timeoutId: number) => void
  windowSetTimeout: (handler: () => void, delayMs: number) => number
}

export function createProjectHierarchyTreeDocumentRowDragHoldWiring (
  deps: T_documentRowDragHoldWiringDeps
) {
  const session = createProjectHierarchyTreeDocumentRowDragHoldSession({
    dragHandleClassName: deps.dragHandleClassName,
    holdDelayMs: deps.holdDelayMs,
    onAllowedDocumentRowDragStart: deps.onAllowedDocumentRowDragStart,
    windowClearTimeout: deps.windowClearTimeout,
    windowSetTimeout: deps.windowSetTimeout
  })

  bindProjectHierarchyTreeDocumentRowDragHoldDragStartCapture({
    clearHoldSession: session.clearHoldSession,
    handleTreeDragStartCapture: session.handleTreeDragStartCapture,
    onUnmounted: deps.onUnmounted,
    treeScrollHostRef: deps.treeScrollHostRef,
    watch: deps.watch
  })

  return session
}
