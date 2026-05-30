import type { T_faFloatingWindowResizeEdge } from 'app/types/I_faFloatingWindowResize'

/**
 * Maps a hovered or active resize handle to per-edge glow flags for adjoining edge highlights.
 */
export function faFloatingWindowFrameResizeHandlesEdgeGlowFromHandle (
  h: T_faFloatingWindowResizeEdge
): Record<'e' | 'n' | 's' | 'w', boolean> {
  return {
    e: h === 'e' || h === 'ne' || h === 'se',
    n: h === 'n' || h === 'nw' || h === 'ne',
    s: h === 's' || h === 'sw' || h === 'se',
    w: h === 'w' || h === 'nw' || h === 'sw'
  }
}
