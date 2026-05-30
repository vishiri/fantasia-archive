import { computed, onBeforeUnmount, ref } from 'vue'

import { FA_FLOATING_WINDOW_RESIZE_HANDLE_PX } from 'app/src/scripts/floatingWindows/floatingWindows_manager'
import { faFloatingWindowFrameResizeHandlesEdgeGlowFromHandle } from './functions/faFloatingWindowFrameResizeHandlesEdgeGlow'

import { createFaFloatingWindowFrameResizeHandles } from './functions/createFaFloatingWindowFrameResizeHandles'

const faFloatingWindowFrameResizeHandlesApi = createFaFloatingWindowFrameResizeHandles({
  FA_FLOATING_WINDOW_RESIZE_HANDLE_PX,
  computed,
  faFloatingWindowFrameResizeHandlesEdgeGlowFromHandle,
  onBeforeUnmount,
  ref
})

export const useFaFloatingWindowFrameResizeHandlesHover =
  faFloatingWindowFrameResizeHandlesApi.useFaFloatingWindowFrameResizeHandlesHover

export const useFaFloatingWindowFrameResizeHandlesChrome =
  faFloatingWindowFrameResizeHandlesApi.useFaFloatingWindowFrameResizeHandlesChrome
