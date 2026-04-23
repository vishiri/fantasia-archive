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

export const FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT: I_FaFloatingWindowFrameLayout = {
  widthFrac: 0.9,
  heightFrac: 0.85,
  minWidthPx: 500,
  minHeightPx: 500,
  marginTopPx: 36,
  marginRightPx: 0,
  marginBottomPx: 0,
  marginLeftPx: 0
}
