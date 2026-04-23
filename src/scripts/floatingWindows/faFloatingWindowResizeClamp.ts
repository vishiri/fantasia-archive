import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import type {
  I_faFloatingWindowResizeViewport,
  T_faFloatingWindowResizeEdge
} from 'app/src/scripts/floatingWindows/faFloatingWindowResizeTypes'

interface I_faFloatingWindowResizeClampWork {
  anchorBottom: number
  anchorRight: number
  candidate: { h: number; w: number }
  mb: number
  ml: number
  mr: number
  mt: number
  minH: number
  minW: number
  vh: number
  vw: number
  x0: number
  y0: number
}

function clampFaFloatingWindowResizeToViewportForEdge (
  edge: T_faFloatingWindowResizeEdge,
  c: I_faFloatingWindowResizeClampWork
): { x: number; y: number; w: number; h: number } {
  switch (edge) {
    case 'e': {
      const w = Math.max(c.minW, Math.min(c.candidate.w, c.vw - c.mr - c.x0))
      const h = Math.max(c.minH, Math.min(c.candidate.h, c.vh - c.mb - c.y0))
      return {
        h,
        w,
        x: c.x0,
        y: c.y0
      }
    }
    case 'w': {
      const w = Math.max(c.minW, Math.min(c.candidate.w, c.anchorRight - c.ml))
      const h = Math.max(c.minH, Math.min(c.candidate.h, c.vh - c.mb - c.y0))
      return {
        h,
        w,
        x: c.anchorRight - w,
        y: c.y0
      }
    }
    case 's': {
      const h = Math.max(c.minH, Math.min(c.candidate.h, c.vh - c.mb - c.y0))
      const w = Math.max(c.minW, Math.min(c.candidate.w, c.vw - c.mr - c.x0))
      return {
        h,
        w,
        x: c.x0,
        y: c.y0
      }
    }
    case 'n': {
      const h = Math.max(c.minH, Math.min(c.candidate.h, c.anchorBottom - c.mt))
      const w = Math.max(c.minW, Math.min(c.candidate.w, c.vw - c.mr - c.x0))
      return {
        h,
        w,
        x: c.x0,
        y: c.anchorBottom - h
      }
    }
    case 'nw': {
      const w = Math.max(c.minW, Math.min(c.candidate.w, c.anchorRight - c.ml))
      const h = Math.max(c.minH, Math.min(c.candidate.h, c.anchorBottom - c.mt))
      return {
        h,
        w,
        x: c.anchorRight - w,
        y: c.anchorBottom - h
      }
    }
    case 'ne': {
      const w = Math.max(c.minW, Math.min(c.candidate.w, c.vw - c.mr - c.x0))
      const h = Math.max(c.minH, Math.min(c.candidate.h, c.anchorBottom - c.mt))
      return {
        h,
        w,
        x: c.x0,
        y: c.anchorBottom - h
      }
    }
    case 'sw': {
      const w = Math.max(c.minW, Math.min(c.candidate.w, c.anchorRight - c.ml))
      const h = Math.max(c.minH, Math.min(c.candidate.h, c.vh - c.mb - c.y0))
      return {
        h,
        w,
        x: c.anchorRight - w,
        y: c.y0
      }
    }
    case 'se': {
      const w = Math.max(c.minW, Math.min(c.candidate.w, c.vw - c.mr - c.x0))
      const h = Math.max(c.minH, Math.min(c.candidate.h, c.vh - c.mb - c.y0))
      return {
        h,
        w,
        x: c.x0,
        y: c.y0
      }
    }
  }
}

/**
 * Clamps a resize candidate while preserving the anchored edges for the active handle
 * (right edge for west/corners, bottom for north/corners, etc.). The generic position clamp
 * would move 'x' or 'y' without adjusting 'w'/'h', which made left/top drags translate the window.
 */
export function clampFaFloatingWindowResizeToViewport (
  layout: I_FaFloatingWindowFrameLayout,
  viewport: I_faFloatingWindowResizeViewport,
  edge: T_faFloatingWindowResizeEdge,
  origin: { x: number; y: number; w: number; h: number },
  candidate: { h: number; w: number }
): { x: number; y: number; w: number; h: number } {
  const x0 = origin.x
  const y0 = origin.y
  return clampFaFloatingWindowResizeToViewportForEdge(edge, {
    anchorBottom: y0 + origin.h,
    anchorRight: x0 + origin.w,
    candidate,
    mb: layout.marginBottomPx,
    ml: layout.marginLeftPx,
    mr: layout.marginRightPx,
    mt: layout.marginTopPx,
    minH: layout.minHeightPx,
    minW: layout.minWidthPx,
    vh: viewport.innerHeight,
    vw: viewport.innerWidth,
    x0,
    y0
  })
}

export function clampFaFloatingWindowFrameToViewport (
  layout: I_FaFloatingWindowFrameLayout,
  viewport: I_faFloatingWindowResizeViewport,
  next: { x: number; y: number; w: number; h: number }
): { x: number; y: number; w: number; h: number } {
  const ml = layout.marginLeftPx
  const mr = layout.marginRightPx
  const mt = layout.marginTopPx
  const mb = layout.marginBottomPx
  const vw = viewport.innerWidth
  const vh = viewport.innerHeight
  let { x, y, w, h } = next
  const minW = layout.minWidthPx
  const minH = layout.minHeightPx

  w = Math.max(minW, w)
  h = Math.max(minH, h)
  x = Math.max(ml, Math.min(x, vw - mr - w))
  y = Math.max(mt, Math.min(y, vh - mb - h))
  w = Math.max(minW, Math.min(w, vw - mr - x))
  h = Math.max(minH, Math.min(h, vh - mb - y))
  x = Math.max(ml, Math.min(x, vw - mr - w))
  y = Math.max(mt, Math.min(y, vh - mb - h))
  return {
    x,
    y,
    w,
    h
  }
}
