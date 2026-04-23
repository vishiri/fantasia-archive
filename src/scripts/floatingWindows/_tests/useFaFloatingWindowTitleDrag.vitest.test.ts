// @vitest-environment jsdom

import { effectScope, ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import { useFaFloatingWindowTitleDrag } from 'app/src/scripts/floatingWindows/useFaFloatingWindowTitleDrag'

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
  return document.createElement('div')
}

/**
 * useFaFloatingWindowTitleDrag
 * Pointermove repositions x and y within margin bounds and calls raiseZ on press.
 */
test('Test that useFaFloatingWindowTitleDrag moves x and y on pointermove after title pointerdown', () => {
  const raiseZ = vi.fn()
  const scope = effectScope()
  scope.run(() => {
    const x = ref(100)
    const y = ref(100)
    const w = ref(400)
    const h = ref(300)
    const { onTitlePointerDown } = useFaFloatingWindowTitleDrag(testLayout, x, y, w, h, raiseZ)
    const target = fakeTarget()
    const down = new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 50,
      clientY: 50,
      pointerId: 1
    })
    Object.defineProperty(down, 'currentTarget', {
      value: target,
      enumerable: true
    })
    onTitlePointerDown(down)
    expect(raiseZ).toHaveBeenCalled()
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        clientX: 80,
        clientY: 70,
        pointerId: 1
      })
    )
    expect(x.value).toBe(130)
    expect(y.value).toBe(120)
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      pointerId: 1
    }))
  })
  scope.stop()
})

/**
 * useFaFloatingWindowTitleDrag
 * Non-primary button does not start a drag.
 */
test('Test that useFaFloatingWindowTitleDrag ignores non-primary pointer buttons', () => {
  const raiseZ = vi.fn()
  const scope = effectScope()
  scope.run(() => {
    const x = ref(0)
    const y = ref(0)
    const w = ref(400)
    const h = ref(300)
    const { isDragActive, onTitlePointerDown } = useFaFloatingWindowTitleDrag(
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
      button: 2,
      clientX: 0,
      clientY: 0,
      pointerId: 3
    })
    Object.defineProperty(ev, 'currentTarget', {
      value: target,
      enumerable: true
    })
    onTitlePointerDown(ev)
    expect(raiseZ).not.toHaveBeenCalled()
    expect(isDragActive.value).toBe(false)
  })
  scope.stop()
})

/**
 * useFaFloatingWindowTitleDrag
 * pointermove with a mismatched pointer id does not change position.
 */
test('Test that useFaFloatingWindowTitleDrag ignores pointermove when the pointer id does not match', () => {
  const scope = effectScope()
  scope.run(() => {
    const x = ref(10)
    const y = ref(20)
    const w = ref(400)
    const h = ref(300)
    const { onTitlePointerDown } = useFaFloatingWindowTitleDrag(
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
      pointerId: 8
    })
    Object.defineProperty(down, 'currentTarget', {
      value: target,
      enumerable: true
    })
    onTitlePointerDown(down)
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
        pointerId: 9
      })
    )
    expect(x.value).toBe(10)
    expect(y.value).toBe(20)
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      pointerId: 8
    }))
  })
  scope.stop()
})

/**
 * useFaFloatingWindowTitleDrag
 * pointerup for a different pointer id does not end the active drag.
 */
test('Test that useFaFloatingWindowTitleDrag ignores pointerup when the pointer id does not match', () => {
  const scope = effectScope()
  scope.run(() => {
    const x = ref(0)
    const y = ref(0)
    const w = ref(400)
    const h = ref(300)
    const { isDragActive, onTitlePointerDown } = useFaFloatingWindowTitleDrag(
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
      pointerId: 4
    })
    Object.defineProperty(down, 'currentTarget', {
      value: target,
      enumerable: true
    })
    onTitlePointerDown(down)
    expect(isDragActive.value).toBe(true)
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      pointerId: 99
    }))
    expect(isDragActive.value).toBe(true)
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      pointerId: 4
    }))
    expect(isDragActive.value).toBe(false)
  })
  scope.stop()
})

/**
 * useFaFloatingWindowTitleDrag
 * pointermove before pointerdown does not change x or y.
 */
test('Test that useFaFloatingWindowTitleDrag ignores pointermove when no drag session is active', () => {
  const scope = effectScope()
  scope.run(() => {
    const x = ref(3)
    const y = ref(4)
    const w = ref(400)
    const h = ref(300)
    useFaFloatingWindowTitleDrag(testLayout, x, y, w, h, () => undefined)
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        clientX: 50,
        clientY: 60,
        pointerId: 1
      })
    )
    expect(x.value).toBe(3)
    expect(y.value).toBe(4)
  })
  scope.stop()
})

/**
 * useFaFloatingWindowTitleDrag
 * pointerup without a matching active drag leaves isDragActive false.
 */
test('Test that useFaFloatingWindowTitleDrag onDragEnd returns early when no drag pointer is active', () => {
  const scope = effectScope()
  scope.run(() => {
    const x = ref(1)
    const y = ref(2)
    const w = ref(400)
    const h = ref(300)
    const { isDragActive } = useFaFloatingWindowTitleDrag(testLayout, x, y, w, h, () => undefined)
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      pointerId: 1
    }))
    expect(isDragActive.value).toBe(false)
  })
  scope.stop()
})
