/**
 * Layout contract for in-renderer floating Window* frames (fractions, min size, viewport insets).
 */
export interface I_FaFloatingWindowFrameLayout {
  heightFrac: number
  marginBottomPx: number
  marginLeftPx: number
  marginRightPx: number
  marginTopPx: number
  minHeightPx: number
  minWidthPx: number
  widthFrac: number
}
