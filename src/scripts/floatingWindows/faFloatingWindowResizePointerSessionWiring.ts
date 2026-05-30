import type { T_faFloatingWindowResizePointerSessionDeps } from 'app/types/I_faFloatingWindowResizePointerSession'

import { computeFaFloatingWindowResizeFrame } from './faFloatingWindowResizeGeometry_manager'
import { applyFaFloatingWindowResizePointerSample as applyFaFloatingWindowResizePointerSampleFn } from './faFloatingWindowResizePointerSample'
import { createFaFloatingWindowResizePointerSessionDeps } from './functions/createFaFloatingWindowResizePointerSessionDeps'

export const faFloatingWindowResizePointerSessionDeps: T_faFloatingWindowResizePointerSessionDeps =
  createFaFloatingWindowResizePointerSessionDeps({
    addWindowEventListener: (type, listener) => {
      window.addEventListener(type, listener as EventListener)
    },
    applySample: applyFaFloatingWindowResizePointerSampleFn,
    cancelAnimationFrame: (id) => window.cancelAnimationFrame(id),
    removeWindowEventListener: (type, listener) => {
      window.removeEventListener(type, listener as EventListener)
    },
    requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
    sampleDeps: {
      computeFaFloatingWindowResizeFrame,
      getInnerHeight: () => window.innerHeight,
      getInnerWidth: () => window.innerWidth
    }
  })
