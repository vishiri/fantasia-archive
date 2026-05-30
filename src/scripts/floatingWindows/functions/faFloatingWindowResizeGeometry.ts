import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type {
  I_faFloatingWindowResizeViewport,
  T_faFloatingWindowResizeEdge
} from 'app/types/I_faFloatingWindowResize'

/** Hit target width for edge and corner resize zones (CSS px). */
export const FA_FLOATING_WINDOW_RESIZE_HANDLE_PX = 8

export function createFaFloatingWindowResizeGeometry (deps: {
  clampFaFloatingWindowResizeToViewport: (
    layout: I_FaFloatingWindowFrameLayout,
    viewport: I_faFloatingWindowResizeViewport,
    edge: T_faFloatingWindowResizeEdge,
    origin: { x: number; y: number; w: number; h: number },
    candidate: { h: number; w: number }
  ) => { x: number; y: number; w: number; h: number }
}): {
    computeFaFloatingWindowResizeFrame: (
      layout: I_FaFloatingWindowFrameLayout,
      viewport: I_faFloatingWindowResizeViewport,
      edge: T_faFloatingWindowResizeEdge,
      origin: { x: number; y: number; w: number; h: number },
      deltaX: number,
      deltaY: number
    ) => { x: number; y: number; w: number; h: number }
  } {
  const computeFaFloatingWindowResizeFrame = (
    layout: I_FaFloatingWindowFrameLayout,
    viewport: I_faFloatingWindowResizeViewport,
    edge: T_faFloatingWindowResizeEdge,
    origin: { x: number; y: number; w: number; h: number },
    deltaX: number,
    deltaY: number
  ): { x: number; y: number; w: number; h: number } => {
    const w0 = origin.w
    const h0 = origin.h
    let w = w0
    let h = h0

    switch (edge) {
      case 'e':
        w = w0 + deltaX
        break
      case 'w':
        w = w0 - deltaX
        break
      case 's':
        h = h0 + deltaY
        break
      case 'n':
        h = h0 - deltaY
        break
      case 'nw': {
        w = w0 - deltaX
        h = h0 - deltaY
        break
      }
      case 'ne': {
        w = w0 + deltaX
        h = h0 - deltaY
        break
      }
      case 'sw': {
        w = w0 - deltaX
        h = h0 + deltaY
        break
      }
      case 'se': {
        w = w0 + deltaX
        h = h0 + deltaY
        break
      }
    }

    return deps.clampFaFloatingWindowResizeToViewport(layout, viewport, edge, origin, {
      h,
      w
    })
  }

  return {
    computeFaFloatingWindowResizeFrame
  }
}
