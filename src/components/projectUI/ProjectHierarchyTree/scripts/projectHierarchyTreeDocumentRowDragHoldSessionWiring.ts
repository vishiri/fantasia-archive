import {
  createProjectHierarchyTreeDocumentRowDragHoldDragStartHandler
} from './projectHierarchyTreeDocumentRowDragHoldDragStartHandlerWiring'

type T_documentRowDragHoldSessionDeps = {
  dragHandleClassName: string
  holdDelayMs: number
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
    const rowElement = event.currentTarget
    if (!(rowElement instanceof HTMLElement)) {
      return
    }
    clearHoldSession()
    pendingRowElement = rowElement
    isPointerDownForHold = true
    rowElement.classList.add(deps.dragHandleClassName)
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
