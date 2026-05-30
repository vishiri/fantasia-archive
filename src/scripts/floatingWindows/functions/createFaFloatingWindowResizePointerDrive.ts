import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type { T_faFloatingWindowResizeEdge } from 'app/types/I_faFloatingWindowResize'

interface I_faFloatingWindowFrameAxisRef {
  value: number
}

interface I_faFloatingWindowFrameBoolRef {
  value: boolean
}

type T_faFloatingWindowResizePointerSessionConstructor = new (
  layout: I_FaFloatingWindowFrameLayout,
  x: I_faFloatingWindowFrameAxisRef,
  y: I_faFloatingWindowFrameAxisRef,
  w: I_faFloatingWindowFrameAxisRef,
  h: I_faFloatingWindowFrameAxisRef,
  raiseZ: () => void,
  isResizeActive: I_faFloatingWindowFrameBoolRef
) => {
  dispose: () => void
  onResizePointerDown: (edge: T_faFloatingWindowResizeEdge, e: PointerEvent) => void
}

type T_applyFaFloatingWindowResizePointerSample = (
  layout: I_FaFloatingWindowFrameLayout,
  activeEdge: T_faFloatingWindowResizeEdge,
  originX: number,
  originY: number,
  originW: number,
  originH: number,
  startCx: number,
  startCy: number,
  e: PointerEvent,
  x: I_faFloatingWindowFrameAxisRef,
  y: I_faFloatingWindowFrameAxisRef,
  w: I_faFloatingWindowFrameAxisRef,
  h: I_faFloatingWindowFrameAxisRef
) => void

export function createFaFloatingWindowResizePointerDrive (deps: {
  FaFloatingWindowResizePointerSession: T_faFloatingWindowResizePointerSessionConstructor
  applyFaFloatingWindowResizePointerSample: T_applyFaFloatingWindowResizePointerSample
}): {
    FaFloatingWindowResizePointerSession: T_faFloatingWindowResizePointerSessionConstructor
    applyFaFloatingWindowResizePointerSample: T_applyFaFloatingWindowResizePointerSample
  } {
  return {
    FaFloatingWindowResizePointerSession: deps.FaFloatingWindowResizePointerSession,
    applyFaFloatingWindowResizePointerSample: deps.applyFaFloatingWindowResizePointerSample
  }
}
