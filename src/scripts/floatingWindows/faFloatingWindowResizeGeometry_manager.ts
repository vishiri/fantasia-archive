import { clampFaFloatingWindowResizeToViewport } from './faFloatingWindowResizeClamp_manager'

import { createFaFloatingWindowResizeGeometry } from './functions/faFloatingWindowResizeGeometry'

const faFloatingWindowResizeGeometryApi = createFaFloatingWindowResizeGeometry({
  clampFaFloatingWindowResizeToViewport
})

export const FA_FLOATING_WINDOW_RESIZE_HANDLE_PX = 8

export const computeFaFloatingWindowResizeFrame =
  faFloatingWindowResizeGeometryApi.computeFaFloatingWindowResizeFrame
