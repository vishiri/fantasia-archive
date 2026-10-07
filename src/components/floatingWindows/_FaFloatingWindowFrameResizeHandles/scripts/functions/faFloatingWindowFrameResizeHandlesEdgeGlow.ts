import type { T_faFloatingWindowResizeEdge } from 'app/types/I_faFloatingWindowResize'

/**
 * Maps a hovered or active resize handle to per-edge glow flags for adjoining edge highlights.
 */
export function faFloatingWindowFrameResizeHandlesEdgeGlowFromHandle (
  h: T_faFloatingWindowResizeEdge
): Record<'e' | 'n' | 's' | 'w', boolean> {
  const e = h === 'e' || h === 'ne' || h === 'se'
  const n = h === 'n' || h === 'nw' || h === 'ne'
  const s = h === 's' || h === 'sw' || h === 'se'
  const w = h === 'w' || h === 'nw' || h === 'sw'
  return {
    e,
    n,
    s,
    w
  }
}
