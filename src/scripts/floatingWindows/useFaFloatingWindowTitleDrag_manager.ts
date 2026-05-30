import { onUnmounted, ref } from 'vue'

import { FaFloatingWindowTitleDragPointerSession } from './faFloatingWindowTitleDragPointerSession'
import { createUseFaFloatingWindowTitleDrag } from './functions/createUseFaFloatingWindowTitleDrag'

export const useFaFloatingWindowTitleDrag = createUseFaFloatingWindowTitleDrag({
  FaFloatingWindowTitleDragPointerSession,
  onUnmounted,
  ref
})
