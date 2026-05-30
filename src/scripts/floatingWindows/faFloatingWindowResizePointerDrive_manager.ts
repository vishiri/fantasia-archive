import { FaFloatingWindowResizePointerSessionBound } from './faFloatingWindowResizePointerSessionBound'
import { applyFaFloatingWindowResizePointerSample as applyFaFloatingWindowResizePointerSampleFn } from './faFloatingWindowResizePointerSample'
import { computeFaFloatingWindowResizeFrame } from './faFloatingWindowResizeGeometry_manager'
import { createBoundApplyFaFloatingWindowResizePointerSample } from './functions/createBoundApplyFaFloatingWindowResizePointerSample'
import { createFaFloatingWindowResizePointerDrive } from './functions/createFaFloatingWindowResizePointerDrive'

const faFloatingWindowResizePointerDriveApi = createFaFloatingWindowResizePointerDrive({
  FaFloatingWindowResizePointerSession: FaFloatingWindowResizePointerSessionBound,
  applyFaFloatingWindowResizePointerSample: createBoundApplyFaFloatingWindowResizePointerSample({
    applySample: applyFaFloatingWindowResizePointerSampleFn,
    sampleDeps: {
      computeFaFloatingWindowResizeFrame,
      getInnerHeight: () => window.innerHeight,
      getInnerWidth: () => window.innerWidth
    }
  })
})

export const FaFloatingWindowResizePointerSession =
  faFloatingWindowResizePointerDriveApi.FaFloatingWindowResizePointerSession

export const applyFaFloatingWindowResizePointerSample =
  faFloatingWindowResizePointerDriveApi.applyFaFloatingWindowResizePointerSample
