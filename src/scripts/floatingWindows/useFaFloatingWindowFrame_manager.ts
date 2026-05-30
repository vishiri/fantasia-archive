import { onUnmounted, ref } from 'vue'

import {
  FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT
} from './functions/faFloatingWindowFrameLayout'
import { registerFaFloatingWindowFrameOpenLayoutWatch } from './useFaFloatingWindowFrameOpenLayoutWatch_manager'
import { useFaFloatingWindowFramePresentation } from './useFaFloatingWindowFramePresentation_manager'
import {
  bumpFloatingWindowZIndex,
  bumpNoteboardFloatingWindowZIndex,
  bumpProjectNoteboardFloatingWindowZIndex,
  bumpProjectStylingFloatingWindowZIndex
} from './functions/faFloatingWindowZIndex'
import { useFaFloatingWindowResize } from './useFaFloatingWindowResize_manager'
import { useFaFloatingWindowTitleDrag } from './useFaFloatingWindowTitleDrag_manager'
import { createUseFaFloatingWindowFrame } from './functions/createUseFaFloatingWindowFrame'
import {
  attachFaFloatingWindowResizeObserver,
  bumpZSelectorForFloatingWindowLayer,
  teardownFaFloatingWindowResizeObserver
} from './faFloatingWindowFrameResizeObserverHelpers'

const useFaFloatingWindowFrameApi = createUseFaFloatingWindowFrame({
  attachFaFloatingWindowResizeObserver,
  bumpZSelectorForFloatingWindowLayer,
  FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT,
  bumpFloatingWindowZIndex,
  bumpNoteboardFloatingWindowZIndex,
  bumpProjectNoteboardFloatingWindowZIndex,
  bumpProjectStylingFloatingWindowZIndex,
  onUnmounted,
  ref,
  registerFaFloatingWindowFrameOpenLayoutWatch,
  useFaFloatingWindowFramePresentation,
  useFaFloatingWindowResize,
  useFaFloatingWindowTitleDrag,
  teardownFaFloatingWindowResizeObserver
})

export const useFaFloatingWindowFrame = useFaFloatingWindowFrameApi.useFaFloatingWindowFrame

export { FA_FLOATING_WINDOW_TITLE_SHORT_FRAME_CLASS } from './functions/useFaFloatingWindowFrameConstants'
