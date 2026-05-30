import { createFaFloatingWindowFrameCenterInViewport } from './functions/faFloatingWindowFrameCenterInViewport'

const faFloatingWindowFrameCenterInViewportApi = createFaFloatingWindowFrameCenterInViewport({
  getInnerHeight: () => window.innerHeight,
  getInnerWidth: () => window.innerWidth
})

export const centerFloatingWindowFrameInViewport =
  faFloatingWindowFrameCenterInViewportApi.centerFloatingWindowFrameInViewport
