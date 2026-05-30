import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'

import { FaFloatingWindowResizePointerSession } from './faFloatingWindowResizePointerSession'
import { faFloatingWindowResizePointerSessionDeps } from './faFloatingWindowResizePointerSessionWiring'

interface I_faFloatingWindowFrameAxisRef {
  value: number
}

interface I_faFloatingWindowFrameBoolRef {
  value: boolean
}

export class FaFloatingWindowResizePointerSessionBound extends FaFloatingWindowResizePointerSession {
  public constructor (
    layout: I_FaFloatingWindowFrameLayout,
    x: I_faFloatingWindowFrameAxisRef,
    y: I_faFloatingWindowFrameAxisRef,
    w: I_faFloatingWindowFrameAxisRef,
    h: I_faFloatingWindowFrameAxisRef,
    raiseZ: () => void,
    isResizeActive: I_faFloatingWindowFrameBoolRef
  ) {
    super(
      faFloatingWindowResizePointerSessionDeps,
      layout,
      x,
      y,
      w,
      h,
      raiseZ,
      isResizeActive
    )
  }
}
