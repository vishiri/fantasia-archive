import { computed } from 'vue'

import {
  FA_FLOATING_WINDOW_TITLE_COMPACT_VERTICAL_THRESHOLD_PX,
  FA_FLOATING_WINDOW_TITLE_SHORT_FRAME_CLASS
} from './functions/useFaFloatingWindowFrameConstants'
import { createUseFaFloatingWindowFramePresentation } from './functions/createUseFaFloatingWindowFramePresentation'

export const useFaFloatingWindowFramePresentation = createUseFaFloatingWindowFramePresentation({
  FA_FLOATING_WINDOW_TITLE_COMPACT_VERTICAL_THRESHOLD_PX,
  FA_FLOATING_WINDOW_TITLE_SHORT_FRAME_CLASS,
  computed
})
