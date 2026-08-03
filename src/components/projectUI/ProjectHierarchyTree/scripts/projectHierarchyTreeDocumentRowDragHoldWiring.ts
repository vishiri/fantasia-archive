import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import { isPrimaryMouseButton } from 'app/src/scripts/dom/dom_manager'

import {
  PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_CLICK_TOLERANCE_PX,
  PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_HOLD_DELAY_MS
} from '../functions/projectHierarchyTreeConstants'
import {
  sampleProjectHierarchyTreeDocumentRowPointer,
  shouldProjectHierarchyTreeDocumentRowClickToggleExpand
} from '../functions/projectHierarchyTreeDocumentRowExpandClickGate'
import {
  shouldBlockDocumentRowDragStartBeforeHoldArmed
} from '../functions/projectHierarchyTreeDocumentRowDragHold'

export function createProjectHierarchyTreeDocumentRowDragHoldDragStartHandler (deps: {
  getArmed: () => boolean
  getIsPointerDownForHold: () => boolean
  onAllowedDocumentRowDragStart: () => void
}) {
  function handleTreeDragStartCapture (event: DragEvent): void {
    const shouldBlock = shouldBlockDocumentRowDragStartBeforeHoldArmed({
      armed: deps.getArmed(),
      isPointerDownForHold: deps.getIsPointerDownForHold()
    })
    if (shouldBlock) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    queueMicrotask(() => {
      deps.onAllowedDocumentRowDragStart()
    })
  }

  return {
    handleTreeDragStartCapture
  }
}

type T_documentRowDragHoldSessionDeps = {
  dragHandleClassName: string
  holdDelayMs: number
  leftPointerDownClassName: string
  onAllowedDocumentRowDragStart: () => void
  windowClearTimeout: (timeoutId: number) => void
  windowSetTimeout: (handler: () => void, delayMs: number) => number
}

export function createProjectHierarchyTreeDocumentRowDragHoldSession (
  deps: T_documentRowDragHoldSessionDeps
) {
  let pendingRowElement: HTMLElement | null = null
  let holdTimerId: number | null = null
  let isDragHoldArmed = false
  let isPointerDownForHold = false
  let isDragStartedFromHold = false

  const dragStartHandler = createProjectHierarchyTreeDocumentRowDragHoldDragStartHandler({
    getArmed: () => isDragHoldArmed,
    getIsPointerDownForHold: () => isPointerDownForHold,
    onAllowedDocumentRowDragStart: deps.onAllowedDocumentRowDragStart
  })

  function clearPointerEndListeners (): void {
    window.removeEventListener('pointerup', handlePointerEnd, true)
    window.removeEventListener('pointercancel', handlePointerEnd, true)
  }

  function clearHoldSession (): void {
    if (holdTimerId !== null) {
      deps.windowClearTimeout(holdTimerId)
      holdTimerId = null
    }
    clearPointerEndListeners()
    if (pendingRowElement !== null) {
      pendingRowElement.classList.remove(deps.dragHandleClassName)
      pendingRowElement.classList.remove(deps.leftPointerDownClassName)
    }
    pendingRowElement = null
    isDragHoldArmed = false
    isPointerDownForHold = false
    isDragStartedFromHold = false
  }

  function armDragHoldAfterDelay (): void {
    if (pendingRowElement === null || !isPointerDownForHold) {
      return
    }
    isDragHoldArmed = true
  }

  function handleHoldTimerFire (): void {
    holdTimerId = null
    armDragHoldAfterDelay()
  }

  function handlePointerEnd (): void {
    if (isDragStartedFromHold) {
      return
    }
    clearHoldSession()
  }

  function handleDocumentRowPointerDown (event: PointerEvent): void {
    if (!isPrimaryMouseButton(event)) {
      return
    }
    const rowElement = event.currentTarget
    if (!(rowElement instanceof HTMLElement)) {
      return
    }
    clearHoldSession()
    pendingRowElement = rowElement
    isPointerDownForHold = true
    rowElement.classList.add(deps.dragHandleClassName)
    rowElement.classList.add(deps.leftPointerDownClassName)
    holdTimerId = deps.windowSetTimeout(handleHoldTimerFire, deps.holdDelayMs)
    window.addEventListener('pointerup', handlePointerEnd, true)
    window.addEventListener('pointercancel', handlePointerEnd, true)
  }

  function markDragStartedFromHold (): void {
    isDragStartedFromHold = true
  }

  function getIsDragHoldArmed (): boolean {
    return isDragHoldArmed
  }

  return {
    clearHoldSession,
    getIsDragHoldArmed,
    handleDocumentRowPointerDown,
    handleTreeDragStartCapture: dragStartHandler.handleTreeDragStartCapture,
    markDragStartedFromHold
  }
}

export function bindProjectHierarchyTreeDocumentRowDragHoldDragStartCapture (deps: {
  clearHoldSession: () => void
  handleTreeDragStartCapture: (event: DragEvent) => void
  onUnmounted: (hook: () => void) => void
  treeScrollHostRef: Ref<HTMLElement | null>
  watch: typeof watchFn
}): void {
  let detachDragStartCapture: (() => void) | null = null

  function bindTreeDragStartCapture (host: HTMLElement | null): void {
    if (detachDragStartCapture !== null) {
      detachDragStartCapture()
      detachDragStartCapture = null
    }
    if (host === null) {
      return
    }
    const listener = deps.handleTreeDragStartCapture
    host.addEventListener('dragstart', listener, true)
    detachDragStartCapture = () => {
      host.removeEventListener('dragstart', listener, true)
    }
  }

  deps.watch(deps.treeScrollHostRef, (host) => {
    bindTreeDragStartCapture(host)
  }, {
    immediate: true
  })

  deps.onUnmounted(() => {
    deps.clearHoldSession()
    if (detachDragStartCapture !== null) {
      detachDragStartCapture()
      detachDragStartCapture = null
    }
  })
}

type T_documentRowDragHoldWiringDeps = {
  dragHandleClassName: string
  holdDelayMs: number
  leftPointerDownClassName: string
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
    leftPointerDownClassName: deps.leftPointerDownClassName,
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
