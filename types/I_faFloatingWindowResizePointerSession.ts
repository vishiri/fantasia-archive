import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type {
  I_faFloatingWindowResizeViewport,
  T_faFloatingWindowResizeEdge
} from 'app/types/I_faFloatingWindowResize'

interface I_faFloatingWindowFrameAxisRef {
  value: number
}

/** Session wiring deps built in faFloatingWindowResizePointerDrive_manager. */
export type T_faFloatingWindowResizePointerSessionDeps = {
  addWindowEventListener: (
    type: string,
    listener: (e: PointerEvent) => void
  ) => void
  applySample: (
    sampleDeps: T_faFloatingWindowResizePointerSampleDeps,
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
  cancelAnimationFrame: (id: number) => void
  removeWindowEventListener: (
    type: string,
    listener: (e: PointerEvent) => void
  ) => void
  requestAnimationFrame: (callback: () => void) => number
  sampleDeps: T_faFloatingWindowResizePointerSampleDeps
}

export type T_faFloatingWindowResizePointerSampleDeps = {
  computeFaFloatingWindowResizeFrame: (
    layout: I_FaFloatingWindowFrameLayout,
    viewport: I_faFloatingWindowResizeViewport,
    edge: T_faFloatingWindowResizeEdge,
    origin: { x: number; y: number; w: number; h: number },
    deltaX: number,
    deltaY: number
  ) => { x: number; y: number; w: number; h: number }
  getInnerHeight: () => number
  getInnerWidth: () => number
}
