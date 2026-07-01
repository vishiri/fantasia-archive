import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

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
