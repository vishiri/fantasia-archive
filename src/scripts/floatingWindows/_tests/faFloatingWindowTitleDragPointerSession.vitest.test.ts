// @vitest-environment jsdom

import { ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FaFloatingWindowTitleDragPointerSession } from 'app/src/scripts/floatingWindows/faFloatingWindowTitleDragPointerSession'
import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'

const testLayout: I_FaFloatingWindowFrameLayout = {
  widthFrac: 0.9,
  heightFrac: 0.85,
  minWidthPx: 200,
  minHeightPx: 200,
  marginTopPx: 36,
  marginRightPx: 0,
  marginBottomPx: 0,
  marginLeftPx: 0
}

beforeEach(() => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1000)
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function fakeTarget (): HTMLElement {
  return document.createElement('div')
}

/**
 * FaFloatingWindowTitleDragPointerSession
 * dispose cancels a scheduled animation frame when teardown runs before the callback.
 */
test('Test that FaFloatingWindowTitleDragPointerSession dispose calls cancelAnimationFrame when a rAF is pending', () => {
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  let rafCallback: FrameRequestCallback | null = null
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
    rafCallback = fn
    return 42
  })
  const x = ref(100)
  const y = ref(100)
  const w = ref(400)
  const h = ref(300)
  const isDragActive = ref(false)
  const session = new FaFloatingWindowTitleDragPointerSession(
    testLayout,
    x,
    y,
    w,
    h,
    () => undefined,
    isDragActive
  )
  const target = fakeTarget()
  const down = new PointerEvent('pointerdown', {
    bubbles: true,
    button: 0,
    clientX: 100,
    clientY: 100,
    pointerId: 1
  })
  Object.defineProperty(down, 'currentTarget', {
    value: target,
    enumerable: true
  })
  session.onTitlePointerDown(down)
  window.dispatchEvent(
    new PointerEvent('pointermove', {
      bubbles: true,
      clientX: 150,
      clientY: 100,
      pointerId: 1
    })
  )
  expect(rafCallback).not.toBeNull()
  session.dispose()
  expect(window.cancelAnimationFrame).toHaveBeenCalledWith(42)
})
