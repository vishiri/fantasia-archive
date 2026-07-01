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
