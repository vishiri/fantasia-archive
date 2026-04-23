// @vitest-environment jsdom

import { effectScope, ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import { useFaFloatingWindowResize } from 'app/src/scripts/floatingWindows/useFaFloatingWindowResize'

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
  vi.restoreAllMocks()
})

function fakeTarget (): HTMLElement {
  const el = document.createElement('div')
  return el
}

/**
 * useFaFloatingWindowResize
 * East-edge drag applies computeFaFloatingWindowResizeFrame deltas and calls raiseZ.
 */
test('Test that useFaFloatingWindowResize pointermove updates width after an east-edge pointerdown', () => {
  const raiseZ = vi.fn()
  const scope = effectScope()
  scope.run(() => {
    const x = ref(100)
    const y = ref(100)
    const w = ref(400)
    const h = ref(300)
    const { isResizeActive, onResizePointerDown } = useFaFloatingWindowResize(
      testLayout,
      x,
      y,
      w,
      h,
      raiseZ
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
    onResizePointerDown('e', down)
    expect(raiseZ).toHaveBeenCalled()
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        clientX: 150,
        clientY: 100,
        pointerId: 1
      })
    )
    expect(w.value).toBe(450)
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      pointerId: 1
    }))
    expect(isResizeActive.value).toBe(false)
  })
  scope.stop()
})

/**
 * useFaFloatingWindowResize
 * Non-primary button does not start resize.
 */
test('Test that useFaFloatingWindowResize ignores non-primary pointer buttons', () => {
  const raiseZ = vi.fn()
  const scope = effectScope()
  scope.run(() => {
    const x = ref(0)
    const y = ref(0)
    const w = ref(400)
    const h = ref(300)
    const { isResizeActive, onResizePointerDown } = useFaFloatingWindowResize(
      testLayout,
      x,
      y,
      w,
      h,
      raiseZ
    )
    const target = fakeTarget()
    const ev = new PointerEvent('pointerdown', {
      bubbles: true,
      button: 1,
      clientX: 0,
      clientY: 0,
      pointerId: 2
    })
    Object.defineProperty(ev, 'currentTarget', {
      value: target,
      enumerable: true
    })
    onResizePointerDown('e', ev)
    expect(raiseZ).not.toHaveBeenCalled()
    expect(isResizeActive.value).toBe(false)
  })
  scope.stop()
})

/**
 * useFaFloatingWindowResize
 * pointerup for a different pointer id leaves the active resize session unchanged.
 */
test('Test that useFaFloatingWindowResize ignores pointerup when the pointer id does not match', () => {
  const scope = effectScope()
  scope.run(() => {
    const x = ref(100)
    const y = ref(100)
    const w = ref(400)
    const h = ref(300)
    const { isResizeActive, onResizePointerDown } = useFaFloatingWindowResize(
      testLayout,
      x,
      y,
      w,
      h,
      () => undefined
    )
    const target = fakeTarget()
    const down = new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 5
    })
    Object.defineProperty(down, 'currentTarget', {
      value: target,
      enumerable: true
    })
    onResizePointerDown('e', down)
    expect(isResizeActive.value).toBe(true)
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      pointerId: 99
    }))
    expect(isResizeActive.value).toBe(true)
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      pointerId: 5
    }))
    expect(isResizeActive.value).toBe(false)
  })
  scope.stop()
})

/**
 * useFaFloatingWindowResize
 * pointermove with a mismatched pointer id does not change geometry.
 */
test('Test that useFaFloatingWindowResize ignores pointermove when the pointer id does not match the active resize', () => {
  const scope = effectScope()
  scope.run(() => {
    const x = ref(100)
    const y = ref(100)
    const w = ref(400)
    const h = ref(300)
    const { onResizePointerDown } = useFaFloatingWindowResize(
      testLayout,
      x,
      y,
      w,
      h,
      () => undefined
    )
    const target = fakeTarget()
    const down = new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 100,
      clientY: 100,
      pointerId: 77
    })
    Object.defineProperty(down, 'currentTarget', {
      value: target,
      enumerable: true
    })
    onResizePointerDown('e', down)
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        clientX: 200,
        clientY: 100,
        pointerId: 78
      })
    )
    expect(w.value).toBe(400)
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      pointerId: 77
    }))
  })
  scope.stop()
})

/**
 * useFaFloatingWindowResize
 * pointermove before pointerdown does not change geometry.
 */
test('Test that useFaFloatingWindowResize ignores pointermove when no resize session is active', () => {
  const scope = effectScope()
  scope.run(() => {
    const x = ref(5)
    const y = ref(6)
    const w = ref(400)
    const h = ref(300)
    useFaFloatingWindowResize(testLayout, x, y, w, h, () => undefined)
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        clientX: 999,
        clientY: 888,
        pointerId: 1
      })
    )
    expect(w.value).toBe(400)
    expect(x.value).toBe(5)
  })
  scope.stop()
})

/**
 * useFaFloatingWindowResize
 * pointerup without an active resize session returns early.
 */
test('Test that useFaFloatingWindowResize onResizeEnd returns early when no resize pointer is active', () => {
  const scope = effectScope()
  scope.run(() => {
    const x = ref(0)
    const y = ref(0)
    const w = ref(400)
    const h = ref(300)
    const { isResizeActive } = useFaFloatingWindowResize(testLayout, x, y, w, h, () => undefined)
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      pointerId: 1
    }))
    expect(isResizeActive.value).toBe(false)
  })
  scope.stop()
})
