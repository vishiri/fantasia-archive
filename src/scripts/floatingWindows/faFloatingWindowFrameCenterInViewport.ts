import type { Ref } from 'vue'

import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'

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
