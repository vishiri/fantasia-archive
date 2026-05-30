import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type {
  I_faFloatingWindowResizeViewport,
  T_faFloatingWindowResizeEdge
} from 'app/types/I_faFloatingWindowResize'

interface I_faFloatingWindowFrameAxisRef {
  value: number
}

export function applyFaFloatingWindowResizePointerSample (
  deps: {
    computeFaFloatingWindowResizeFrame: (
      layout: I_FaFloatingWindowFrameLayout,
      viewport: I_faFloatingWindowResizeViewport,
      edge: T_faFloatingWindowResizeEdge,
      origin: { x: number; y: number; w: number; h: number },
      deltaX: number,
      deltaY: number
    ) => { x: number; y: number; w: number; h: number }
    getInnerHeight: () => number
    getInnerWidth: () => number
  },
  layout: I_FaFloatingWindowFrameLayout,
  activeEdge: T_faFloatingWindowResizeEdge,
  originX: number,
  originY: number,
  originW: number,
  originH: number,
  startCx: number,
  startCy: number,
  e: PointerEvent,
  x: I_faFloatingWindowFrameAxisRef,
  y: I_faFloatingWindowFrameAxisRef,
  w: I_faFloatingWindowFrameAxisRef,
  h: I_faFloatingWindowFrameAxisRef
): void {
  const deltaX = e.clientX - startCx
  const deltaY = e.clientY - startCy
  const viewport = {
    innerHeight: deps.getInnerHeight(),
    innerWidth: deps.getInnerWidth()
  }
  const next = deps.computeFaFloatingWindowResizeFrame(
    layout,
    viewport,
    activeEdge,
    {
      h: originH,
      w: originW,
      x: originX,
      y: originY
    },
    deltaX,
    deltaY
  )
  x.value = next.x
  y.value = next.y
  w.value = next.w
  h.value = next.h
}
