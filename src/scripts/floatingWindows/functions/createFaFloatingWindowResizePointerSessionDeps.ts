import type { T_faFloatingWindowResizePointerSessionDeps } from 'app/types/I_faFloatingWindowResizePointerSession'

export function createFaFloatingWindowResizePointerSessionDeps (deps: {
  addWindowEventListener: T_faFloatingWindowResizePointerSessionDeps['addWindowEventListener']
  applySample: T_faFloatingWindowResizePointerSessionDeps['applySample']
  cancelAnimationFrame: T_faFloatingWindowResizePointerSessionDeps['cancelAnimationFrame']
  removeWindowEventListener: T_faFloatingWindowResizePointerSessionDeps['removeWindowEventListener']
  requestAnimationFrame: T_faFloatingWindowResizePointerSessionDeps['requestAnimationFrame']
  sampleDeps: T_faFloatingWindowResizePointerSessionDeps['sampleDeps']
}): T_faFloatingWindowResizePointerSessionDeps {
  return {
    addWindowEventListener: deps.addWindowEventListener,
    applySample: deps.applySample,
    cancelAnimationFrame: deps.cancelAnimationFrame,
    removeWindowEventListener: deps.removeWindowEventListener,
    requestAnimationFrame: deps.requestAnimationFrame,
    sampleDeps: deps.sampleDeps
  }
}
