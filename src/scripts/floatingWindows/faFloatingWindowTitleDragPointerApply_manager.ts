import { createFaFloatingWindowTitleDragPointerApply } from './functions/faFloatingWindowTitleDragPointerApply'

const faFloatingWindowTitleDragPointerApplyApi = createFaFloatingWindowTitleDragPointerApply({
  getInnerHeight: () => window.innerHeight,
  getInnerWidth: () => window.innerWidth
})

export const applyFaFloatingWindowTitleDragFromPointer =
  faFloatingWindowTitleDragPointerApplyApi.applyFaFloatingWindowTitleDragFromPointer
