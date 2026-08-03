import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type {
  I_faFloatingWindowFrameAxisRef,
  I_faFloatingWindowFrameBoolRef
} from 'app/types/I_faFloatingWindowResizePointerSession'

import { FaFloatingWindowResizePointerSession } from './faFloatingWindowResizePointerSession'
import { faFloatingWindowResizePointerSessionDeps } from './faFloatingWindowResizePointerSessionWiring'

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
