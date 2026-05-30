/** Resize handle id for in-renderer floating window frames (edges and corners). */
export type T_faFloatingWindowResizeEdge = 'e' | 'n' | 'ne' | 'nw' | 's' | 'se' | 'sw' | 'w'

/** Viewport dimensions used for floating-window resize clamping. */
export interface I_faFloatingWindowResizeViewport {
  innerHeight: number
  innerWidth: number
}
