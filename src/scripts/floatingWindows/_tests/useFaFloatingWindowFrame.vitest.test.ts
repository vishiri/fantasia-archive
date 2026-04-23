// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- multiple inline defineComponent harnesses for the composable */

import { mount } from '@vue/test-utils'
import { defineComponent, ref, type Ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

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

function mountFloatingFrameHarness (
  useFaFloatingWindowFrame: (
    visible: Ref<boolean>,
    layout?: I_FaFloatingWindowFrameLayout
  ) => ReturnType<typeof import('app/src/scripts/floatingWindows/useFaFloatingWindowFrame').useFaFloatingWindowFrame>
): { visible: Ref<boolean>; wrapper: ReturnType<typeof mount> } {
  const visible = ref(false)
  const Harness = defineComponent({
    setup () {
      const frameApi = useFaFloatingWindowFrame(visible, testLayout)
      return {
        ...frameApi,
        visible
      }
    },
    template: `
      <div>
        <div
          ref="frameRef"
          data-test-locator="floating-frame-harness"
          :style="frameStyle"
          @pointerdown.self="onFramePointerDown"
        >host</div>
      </div>
    `
  })
  const wrapper = mount(Harness)
  return {
    visible,
    wrapper
  }
}

beforeEach(() => {
  vi.resetModules()
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1000)
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  globalThis.ResizeObserver = class {
    observe = vi.fn()
    disconnect = vi.fn()
    constructor (_cb: ResizeObserverCallback) {
      void _cb
    }
  } as unknown as typeof ResizeObserver
})

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * useFaFloatingWindowFrame
 * Opening applies centerInViewport geometry and raises z-index within the floating band.
 */
test('Test that useFaFloatingWindowFrame centers the frame and bumps z-index when visibility becomes true', async () => {
  const { useFaFloatingWindowFrame } = await import('app/src/scripts/floatingWindows/useFaFloatingWindowFrame')
  const { visible, wrapper } = mountFloatingFrameHarness(useFaFloatingWindowFrame)
  const vm = wrapper.vm as unknown as {
    frameStyle: { left: string; top: string; width: string; height: string; zIndex: number }
  }
  const initialZ = vm.frameStyle.zIndex
  visible.value = true
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
  expect(vm.frameStyle.left).toBe('50px')
  expect(vm.frameStyle.top).toBe('60px')
  expect(vm.frameStyle.width).toBe('900px')
  expect(vm.frameStyle.height).toBe('680px')
  expect(vm.frameStyle.zIndex).toBeGreaterThan(initialZ)
  expect(vm.frameStyle.zIndex).toBeLessThan(6000)
  wrapper.unmount()
})

/**
 * useFaFloatingWindowFrame
 * ResizeObserver attaches when open and disconnects when closed or unmounted.
 */
test('Test that useFaFloatingWindowFrame wires ResizeObserver observe and disconnect around visibility', async () => {
  const observe = vi.fn()
  const disconnect = vi.fn()
  globalThis.ResizeObserver = class {
    observe = observe
    disconnect = disconnect
    constructor (_cb: ResizeObserverCallback) {
      void _cb
    }
  } as unknown as typeof ResizeObserver

  const { useFaFloatingWindowFrame } = await import('app/src/scripts/floatingWindows/useFaFloatingWindowFrame')
  const { visible, wrapper } = mountFloatingFrameHarness(useFaFloatingWindowFrame)
  visible.value = true
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
  expect(observe).toHaveBeenCalledTimes(1)
  const node = observe.mock.calls[0][0] as HTMLElement
  expect(node).toBe(wrapper.find('[data-test-locator="floating-frame-harness"]').element)

  visible.value = false
  await wrapper.vm.$nextTick()
  expect(disconnect).toHaveBeenCalled()

  wrapper.unmount()
})

/**
 * useFaFloatingWindowFrame
 * Frame self pointerdown raises z-index for click-to-front on the shell.
 */
test('Test that useFaFloatingWindowFrame onFramePointerDown bumps z-index when the frame element receives pointerdown', async () => {
  const { useFaFloatingWindowFrame } = await import('app/src/scripts/floatingWindows/useFaFloatingWindowFrame')
  const { visible, wrapper } = mountFloatingFrameHarness(useFaFloatingWindowFrame)
  visible.value = true
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
  const vm = wrapper.vm as unknown as { frameStyle: { zIndex: number } }
  const zBefore = vm.frameStyle.zIndex
  const el = wrapper.find('[data-test-locator="floating-frame-harness"]').element
  el.dispatchEvent(new PointerEvent('pointerdown', {
    bubbles: true,
    button: 0
  }))
  await wrapper.vm.$nextTick()
  expect(vm.frameStyle.zIndex).toBeGreaterThan(zBefore)
  expect(vm.frameStyle.zIndex).toBeLessThan(6000)
  wrapper.unmount()
})

/**
 * useFaFloatingWindowFrame
 * When the template never assigns frameRef, ResizeObserver observe is not called after open.
 */
test('Test that useFaFloatingWindowFrame does not observe when frameRef stays unset', async () => {
  const observe = vi.fn()
  globalThis.ResizeObserver = class {
    observe = observe
    disconnect = vi.fn()
    constructor (_cb: ResizeObserverCallback) {
      void _cb
    }
  } as unknown as typeof ResizeObserver

  const { useFaFloatingWindowFrame } = await import('app/src/scripts/floatingWindows/useFaFloatingWindowFrame')
  const visible = ref(false)
  const NoRefHarness = defineComponent({
    setup () {
      const api = useFaFloatingWindowFrame(visible, testLayout)
      return {
        ...api,
        visible
      }
    },
    template: '<div><div :style="frameStyle">no-ref</div></div>'
  })
  const wrapper = mount(NoRefHarness)
  visible.value = true
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
  expect(observe).not.toHaveBeenCalled()
  wrapper.unmount()
})

/**
 * useFaFloatingWindowFrame
 * ResizeObserver callback copies offsetWidth and offsetHeight into w and h when not dragging or resizing.
 */
test('Test that useFaFloatingWindowFrame ResizeObserver callback syncs w and h from the frame element', async () => {
  let resizeObserverCallback: ResizeObserverCallback | null = null
  globalThis.ResizeObserver = class {
    observe = vi.fn()
    disconnect = vi.fn()
    constructor (cb: ResizeObserverCallback) {
      resizeObserverCallback = cb
    }
  } as unknown as typeof ResizeObserver

  const { useFaFloatingWindowFrame } = await import('app/src/scripts/floatingWindows/useFaFloatingWindowFrame')
  const { visible, wrapper } = mountFloatingFrameHarness(useFaFloatingWindowFrame)
  visible.value = true
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
  const el = wrapper.find('[data-test-locator="floating-frame-harness"]').element
  Object.defineProperty(el, 'offsetWidth', {
    configurable: true,
    value: 333
  })
  Object.defineProperty(el, 'offsetHeight', {
    configurable: true,
    value: 222
  })
  expect(resizeObserverCallback).not.toBeNull()
  resizeObserverCallback!([], {} as ResizeObserver)
  await wrapper.vm.$nextTick()
  const vm = wrapper.vm as unknown as { frameStyle: { width: string; height: string } }
  expect(vm.frameStyle.width).toBe('333px')
  expect(vm.frameStyle.height).toBe('222px')
  wrapper.unmount()
})

/**
 * useFaFloatingWindowFrame
 * ResizeObserver callback skips syncing w and h while the title drag session is active.
 */
test('Test that useFaFloatingWindowFrame ResizeObserver callback does not run while isDragActive', async () => {
  let resizeObserverCallback: ResizeObserverCallback | null = null
  globalThis.ResizeObserver = class {
    observe = vi.fn()
    disconnect = vi.fn()
    constructor (cb: ResizeObserverCallback) {
      resizeObserverCallback = cb
    }
  } as unknown as typeof ResizeObserver

  const { useFaFloatingWindowFrame } = await import('app/src/scripts/floatingWindows/useFaFloatingWindowFrame')
  const visible = ref(false)
  const Harness = defineComponent({
    setup () {
      const frameApi = useFaFloatingWindowFrame(visible, testLayout)
      return {
        ...frameApi,
        visible
      }
    },
    template: `
      <div>
        <div
          ref="frameRef"
          data-test-locator="floating-frame-harness"
          :style="frameStyle"
          @pointerdown.self="onFramePointerDown"
        >
          <span data-test-locator="title-mock" @pointerdown="onTitlePointerDown">t</span>
        </div>
      </div>
    `
  })
  const wrapper = mount(Harness)
  visible.value = true
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
  const el = wrapper.find('[data-test-locator="floating-frame-harness"]').element
  wrapper.find('[data-test-locator="title-mock"]').element.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 3
    })
  )
  Object.defineProperty(el, 'offsetWidth', {
    configurable: true,
    value: 777
  })
  Object.defineProperty(el, 'offsetHeight', {
    configurable: true,
    value: 666
  })
  resizeObserverCallback!([], {} as ResizeObserver)
  await wrapper.vm.$nextTick()
  const vm = wrapper.vm as unknown as { frameStyle: { width: string; height: string } }
  expect(vm.frameStyle.width).toBe('900px')
  expect(vm.frameStyle.height).toBe('680px')
  window.dispatchEvent(new PointerEvent('pointerup', {
    bubbles: true,
    pointerId: 3
  }))
  await wrapper.vm.$nextTick()
  wrapper.unmount()
})

/**
 * useFaFloatingWindowFrame
 * ResizeObserver callback skips syncing when offsetWidth and offsetHeight are zero.
 */
test('Test that useFaFloatingWindowFrame ResizeObserver callback ignores zero offset dimensions', async () => {
  let resizeObserverCallback: ResizeObserverCallback | null = null
  globalThis.ResizeObserver = class {
    observe = vi.fn()
    disconnect = vi.fn()
    constructor (cb: ResizeObserverCallback) {
      resizeObserverCallback = cb
    }
  } as unknown as typeof ResizeObserver

  const { useFaFloatingWindowFrame } = await import('app/src/scripts/floatingWindows/useFaFloatingWindowFrame')
  const { visible, wrapper } = mountFloatingFrameHarness(useFaFloatingWindowFrame)
  visible.value = true
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
  const el = wrapper.find('[data-test-locator="floating-frame-harness"]').element
  Object.defineProperty(el, 'offsetWidth', {
    configurable: true,
    value: 0
  })
  Object.defineProperty(el, 'offsetHeight', {
    configurable: true,
    value: 0
  })
  resizeObserverCallback!([], {} as ResizeObserver)
  await wrapper.vm.$nextTick()
  const vm = wrapper.vm as unknown as { frameStyle: { width: string; height: string } }
  expect(vm.frameStyle.width).toBe('900px')
  expect(vm.frameStyle.height).toBe('680px')
  wrapper.unmount()
})

/**
 * useFaFloatingWindowFrame
 * ResizeObserver callback skips syncing while a resize pointer session is active.
 */
test('Test that useFaFloatingWindowFrame ResizeObserver callback does not run while isResizeActive', async () => {
  let resizeObserverCallback: ResizeObserverCallback | null = null
  globalThis.ResizeObserver = class {
    observe = vi.fn()
    disconnect = vi.fn()
    constructor (cb: ResizeObserverCallback) {
      resizeObserverCallback = cb
    }
  } as unknown as typeof ResizeObserver

  const { useFaFloatingWindowFrame } = await import('app/src/scripts/floatingWindows/useFaFloatingWindowFrame')
  const visible = ref(false)
  const Harness = defineComponent({
    setup () {
      const frameApi = useFaFloatingWindowFrame(visible, testLayout)
      return {
        ...frameApi,
        visible
      }
    },
    template: `
      <div>
        <div
          ref="frameRef"
          data-test-locator="floating-frame-harness"
          :style="frameStyle"
          @pointerdown.self="onFramePointerDown"
        >
          <span
            data-test-locator="resize-mock"
            @pointerdown="onResizePointerDown('e', $event)"
          >r</span>
        </div>
      </div>
    `
  })
  const wrapper = mount(Harness)
  visible.value = true
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
  const el = wrapper.find('[data-test-locator="floating-frame-harness"]').element
  wrapper.find('[data-test-locator="resize-mock"]').element.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 4
    })
  )
  Object.defineProperty(el, 'offsetWidth', {
    configurable: true,
    value: 888
  })
  Object.defineProperty(el, 'offsetHeight', {
    configurable: true,
    value: 444
  })
  resizeObserverCallback!([], {} as ResizeObserver)
  await wrapper.vm.$nextTick()
  const vm = wrapper.vm as unknown as { frameStyle: { width: string; height: string } }
  expect(vm.frameStyle.width).toBe('900px')
  window.dispatchEvent(new PointerEvent('pointerup', {
    bubbles: true,
    pointerId: 4
  }))
  await wrapper.vm.$nextTick()
  wrapper.unmount()
})
