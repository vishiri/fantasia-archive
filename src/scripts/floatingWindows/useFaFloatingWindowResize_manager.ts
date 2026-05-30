import { onUnmounted, ref } from 'vue'

import { FaFloatingWindowResizePointerSession } from './faFloatingWindowResizePointerDrive_manager'
import { createUseFaFloatingWindowResize } from './functions/createUseFaFloatingWindowResize'

export const useFaFloatingWindowResize = createUseFaFloatingWindowResize({
  FaFloatingWindowResizePointerSession,
  onUnmounted,
  ref
})
