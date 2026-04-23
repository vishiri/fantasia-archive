import { computed, nextTick, onUnmounted, ref, watch, type CSSProperties, type Ref } from 'vue'

import {
  FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT,
  type I_FaFloatingWindowFrameLayout
} from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import { bumpFloatingWindowZIndex } from 'app/src/scripts/floatingWindows/faFloatingWindowZIndex'
import { useFaFloatingWindowResize } from 'app/src/scripts/floatingWindows/useFaFloatingWindowResize'
import { useFaFloatingWindowTitleDrag } from 'app/src/scripts/floatingWindows/useFaFloatingWindowTitleDrag'

export type { I_FaFloatingWindowFrameLayout }

export function centerFloatingWindowFrameInViewport (
  layout: I_FaFloatingWindowFrameLayout,
  x: Ref<number>,
  y: Ref<number>,
  w: Ref<number>,
  h: Ref<number>
): void {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const maxUsableW = vw - layout.marginLeftPx - layout.marginRightPx
  const nextW = Math.max(
    layout.minWidthPx,
    Math.min(maxUsableW, Math.floor(vw * layout.widthFrac))
  )
  const nextH = Math.max(layout.minHeightPx, Math.floor(vh * layout.heightFrac))
  w.value = nextW
  h.value = nextH
  const idealX = Math.floor((vw - nextW) / 2)
  const idealY = Math.floor((vh - nextH) / 2)
  x.value = Math.min(
    vw - nextW - layout.marginRightPx,
    Math.max(layout.marginLeftPx, idealX)
  )
  y.value = Math.min(
    vh - nextH - layout.marginBottomPx,
    Math.max(layout.marginTopPx, idealY)
  )
}

/**
 * Draggable, resizable fixed-position frame for in-renderer floating windows (Vue 3 + Quasar 2).
 * The published '@quasar/quasar-ui-qwindow' targets Quasar v1 / Vue 2 only, so Fantasia Archive ships this composable instead.
 */
export function useFaFloatingWindowFrame (
  visible: Ref<boolean>,
  layout: I_FaFloatingWindowFrameLayout = FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT
) {
  const frameRef = ref<HTMLElement | null>(null)
  const x = ref(0)
  const y = ref(0)
  const w = ref(800)
  const h = ref(600)
  const z = ref(bumpFloatingWindowZIndex())

  let resizeObserver: ResizeObserver | null = null

  function raiseZ (): void {
    z.value = bumpFloatingWindowZIndex()
  }

  function teardownResizeObserver (): void {
    if (resizeObserver !== null) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }

  const { isDragActive, onTitlePointerDown } = useFaFloatingWindowTitleDrag(layout, x, y, w, h, raiseZ)
  const { isResizeActive, onResizePointerDown } = useFaFloatingWindowResize(layout, x, y, w, h, raiseZ)

  function attachResizeObserver (): void {
    teardownResizeObserver()
    const el = frameRef.value
    if (el === null) {
      return
    }
    resizeObserver = new ResizeObserver(() => {
      const node = frameRef.value
      if (node === null || isDragActive.value || isResizeActive.value) {
        return
      }
      const rw = node.offsetWidth
      const rh = node.offsetHeight
      if (rw > 0) {
        w.value = rw
      }
      if (rh > 0) {
        h.value = rh
      }
    })
    resizeObserver.observe(el)
  }

  watch(visible, async (isOpen) => {
    if (!isOpen) {
      teardownResizeObserver()
      return
    }
    centerFloatingWindowFrameInViewport(layout, x, y, w, h)
    raiseZ()
    await nextTick()
    attachResizeObserver()
  })

  function onFramePointerDown (): void {
    raiseZ()
  }

  const frameStyle = computed((): CSSProperties => ({
    height: `${h.value}px`,
    left: `${x.value}px`,
    minHeight: `${layout.minHeightPx}px`,
    minWidth: `${layout.minWidthPx}px`,
    overflow: 'hidden',
    position: 'fixed',
    top: `${y.value}px`,
    width: `${w.value}px`,
    zIndex: z.value
  }))

  onUnmounted(() => {
    teardownResizeObserver()
  })

  return {
    frameRef,
    frameStyle,
    onFramePointerDown,
    onResizePointerDown,
    onTitlePointerDown
  }
}
