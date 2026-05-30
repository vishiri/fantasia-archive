import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'

interface I_faFloatingWindowFrameAxisRef {
  value: number
}

export function createFaFloatingWindowFrameCenterInViewport (deps: {
  getInnerHeight: () => number
  getInnerWidth: () => number
}): {
    centerFloatingWindowFrameInViewport: (
      layout: I_FaFloatingWindowFrameLayout,
      x: I_faFloatingWindowFrameAxisRef,
      y: I_faFloatingWindowFrameAxisRef,
      w: I_faFloatingWindowFrameAxisRef,
      h: I_faFloatingWindowFrameAxisRef
    ) => void
  } {
  const centerFloatingWindowFrameInViewport = (
    layout: I_FaFloatingWindowFrameLayout,
    x: I_faFloatingWindowFrameAxisRef,
    y: I_faFloatingWindowFrameAxisRef,
    w: I_faFloatingWindowFrameAxisRef,
    h: I_faFloatingWindowFrameAxisRef
  ): void => {
    const vw = deps.getInnerWidth()
    const vh = deps.getInnerHeight()
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

  return {
    centerFloatingWindowFrameInViewport
  }
}
