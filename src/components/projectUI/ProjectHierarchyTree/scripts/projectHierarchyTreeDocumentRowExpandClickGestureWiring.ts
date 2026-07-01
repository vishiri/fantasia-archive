import type { Ref } from 'vue'

import {
  sampleProjectHierarchyTreeDocumentRowPointer,
  shouldProjectHierarchyTreeDocumentRowClickToggleExpand
} from '../functions/projectHierarchyTreeDocumentRowExpandClickGate'
import {
  PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_CLICK_TOLERANCE_PX,
  PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_HOLD_DELAY_MS
} from '../functions/projectHierarchyTreeConstants'

export function createProjectHierarchyTreeDocumentRowExpandClickGestureWiring (deps: {
  isTreeDragActive: Ref<boolean>
}) {
  let pointerDownSample: { clientX: number, clientY: number } | null = null
  let pointerDownTimestampMs: number | null = null
  let dragStartedForGesture = false

  function beginDocumentRowGesture (event: { clientX: number, clientY: number }): void {
    pointerDownSample = sampleProjectHierarchyTreeDocumentRowPointer(event)
    pointerDownTimestampMs = Date.now()
    dragStartedForGesture = false
  }

  function markDragStartedForGesture (): void {
    dragStartedForGesture = true
  }

  function shouldDocumentRowClickToggleExpand (event: {
    clientX: number
    clientY: number
  }): boolean {
    const holdDurationMs = pointerDownTimestampMs === null
      ? Number.POSITIVE_INFINITY
      : Date.now() - pointerDownTimestampMs
    return shouldProjectHierarchyTreeDocumentRowClickToggleExpand({
      clickClientX: event.clientX,
      clickClientY: event.clientY,
      dragStartedForGesture,
      holdDelayMs: PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_HOLD_DELAY_MS,
      holdDurationMs,
      isTreeDragActive: deps.isTreeDragActive.value,
      pointerDownSample,
      tolerancePx: PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_CLICK_TOLERANCE_PX
    })
  }

  function clearDocumentRowGesture (): void {
    pointerDownSample = null
    pointerDownTimestampMs = null
    dragStartedForGesture = false
  }

  return {
    beginDocumentRowGesture,
    clearDocumentRowGesture,
    markDragStartedForGesture,
    shouldDocumentRowClickToggleExpand
  }
}
