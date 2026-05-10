/**
 * Pixel rectangle persisted for in-renderer floating windows (renderer/viewport space).
 * Matches 'left'/'top'/'width'/'height' from 'useFaFloatingWindowFrame' between drag/resize sessions.
 */
export interface I_faFloatingWindowPersistedRect {
  height: number
  width: number
  x: number
  y: number
}
