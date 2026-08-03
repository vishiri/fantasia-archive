import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type { T_faFloatingWindowResizeEdge } from 'app/types/I_faFloatingWindowResize'
import type {
  I_faFloatingWindowFrameAxisRef,
  T_faFloatingWindowResizePointerSampleDeps
} from 'app/types/I_faFloatingWindowResizePointerSession'

type T_applyFaFloatingWindowResizePointerSampleFull = (
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

type T_applyFaFloatingWindowResizePointerSampleBound = (
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

export function createBoundApplyFaFloatingWindowResizePointerSample (deps: {
  applySample: T_applyFaFloatingWindowResizePointerSampleFull
  sampleDeps: T_faFloatingWindowResizePointerSampleDeps
}): T_applyFaFloatingWindowResizePointerSampleBound {
  const bound: T_applyFaFloatingWindowResizePointerSampleBound = (
    layout,
    activeEdge,
    originX,
    originY,
    originW,
    originH,
    startCx,
    startCy,
    e,
    x,
    y,
    w,
    h
  ) => {
    deps.applySample(
      deps.sampleDeps,
      layout,
      activeEdge,
      originX,
      originY,
      originW,
      originH,
      startCx,
      startCy,
      e,
      x,
      y,
      w,
      h
    )
  }

  return bound
}
