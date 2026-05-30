import { nextTick, watch } from 'vue'

import { clampFaFloatingWindowFrameToViewport } from './faFloatingWindowResizeClamp_manager'
import { centerFloatingWindowFrameInViewport } from './faFloatingWindowFrameCenterInViewport_manager'
import { isUsableFaFloatingWindowPersistedRect } from './faFloatingWindowPersistedGeometry_manager'
import { registerFaFloatingWindowFrameOpenLayoutWatch as registerFaFloatingWindowFrameOpenLayoutWatchImpl } from './registerFaFloatingWindowFrameOpenLayoutWatchImpl'

import { createRegisterFaFloatingWindowFrameOpenLayoutWatch } from './functions/createRegisterFaFloatingWindowFrameOpenLayoutWatch'

const registerFaFloatingWindowFrameOpenLayoutWatchApi = createRegisterFaFloatingWindowFrameOpenLayoutWatch({
  centerFloatingWindowFrameInViewport,
  clampFaFloatingWindowFrameToViewport,
  isUsableFaFloatingWindowPersistedRect: (rect, layout) =>
    isUsableFaFloatingWindowPersistedRect(
      rect as import('app/types/I_faFloatingWindowPersistedRect').I_faFloatingWindowPersistedRect | null | undefined,
      layout
    ),
  nextTick,
  registerFaFloatingWindowFrameOpenLayoutWatchImpl,
  watch
})

export const registerFaFloatingWindowFrameOpenLayoutWatch =
  registerFaFloatingWindowFrameOpenLayoutWatchApi.registerFaFloatingWindowFrameOpenLayoutWatch
