import type { I_ref } from 'app/types/I_vueCompositionShims'

export function bindFaWorkspaceSidebarLiveWidthSync (input: {
  attachWorkspaceSidebarLiveWidthSync: (options: {
    onWidthPx: (widthPx: number) => void
    panelElement: HTMLElement
  }) => () => void
  onUnmounted: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  setLiveWorkspaceSidebarWidthPx: (widthPx: number) => void
  watch: (
    source: () => HTMLElement | null,
    effect: (panelElement: HTMLElement | null) => void
  ) => void
}): I_ref<HTMLElement | null> {
  const workspaceSidebarPanelRef = input.ref<HTMLElement | null>(null)
  let detachLiveWidthSync: (() => void) | undefined

  function detachWorkspaceSidebarLiveWidthSync (): void {
    if (detachLiveWidthSync !== undefined) {
      detachLiveWidthSync()
      detachLiveWidthSync = undefined
    }
  }

  input.watch(
    () => workspaceSidebarPanelRef.value,
    (panelElement) => {
      detachWorkspaceSidebarLiveWidthSync()
      if (panelElement === null) {
        return
      }
      detachLiveWidthSync = input.attachWorkspaceSidebarLiveWidthSync({
        onWidthPx: (widthPx) => {
          input.setLiveWorkspaceSidebarWidthPx(widthPx)
        },
        panelElement
      })
    }
  )

  input.onUnmounted(() => {
    detachWorkspaceSidebarLiveWidthSync()
  })

  return workspaceSidebarPanelRef
}

/**
 * Mirrors the rendered workspace sidebar panel width while the QSplitter is dragged.
 */
export function attachFaWorkspaceSidebarLiveWidthSync (input: {
  onWidthPx: (widthPx: number) => void
  panelElement: HTMLElement
}): () => void {
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (entry === undefined) {
      return
    }
    input.onWidthPx(entry.contentRect.width)
  })
  observer.observe(input.panelElement)
  input.onWidthPx(input.panelElement.getBoundingClientRect().width)

  return () => {
    observer.disconnect()
  }
}
