import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import FaFloatingWindowFrameResizeHandles from '../FaFloatingWindowFrameResizeHandles.vue'

/**
 * FaFloatingWindowFrameResizeHandles
 * Renders eight pointer hit zones and forwards resize pointerdown through the callback prop.
 */
test('Test that FaFloatingWindowFrameResizeHandles wires all edges to onResizePointerDown', () => {
  const onResizePointerDown = vi.fn()
  const w = mount(FaFloatingWindowFrameResizeHandles, {
    props: { onResizePointerDown }
  })

  expect(w.find('[data-test-locator="faFloatingWindowFrameResizeHandles"]').exists()).toBe(true)

  const fireDown = (selector: string, edge: string): void => {
    w.find(selector).element.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        pointerId: 42
      })
    )
    expect(onResizePointerDown).toHaveBeenLastCalledWith(edge, expect.any(PointerEvent))
  }

  fireDown('.faFloatingWindowFrameResizeHandles__e', 'e')
  fireDown('.faFloatingWindowFrameResizeHandles__n', 'n')
  fireDown('.faFloatingWindowFrameResizeHandles__s', 's')
  fireDown('.faFloatingWindowFrameResizeHandles__w', 'w')
  fireDown('.faFloatingWindowFrameResizeHandles__nw', 'nw')
  fireDown('.faFloatingWindowFrameResizeHandles__ne', 'ne')
  fireDown('.faFloatingWindowFrameResizeHandles__sw', 'sw')
  fireDown('.faFloatingWindowFrameResizeHandles__se', 'se')

  expect(onResizePointerDown).toHaveBeenCalledTimes(8)

  w.unmount()
})

/**
 * FaFloatingWindowFrameResizeHandles
 * Hovering a corner applies the glow class to that corner and both adjoining edge strips.
 */
test('Test that FaFloatingWindowFrameResizeHandles highlights north and west when the north-west corner is hovered', async () => {
  const w = mount(FaFloatingWindowFrameResizeHandles, {
    props: { onResizePointerDown: vi.fn() }
  })

  await w.find('.faFloatingWindowFrameResizeHandles__nw').trigger('mouseenter')

  expect(w.find('.faFloatingWindowFrameResizeHandles__n').classes()).toContain(
    'faFloatingWindowFrameResizeHandles__hit--glow'
  )
  expect(w.find('.faFloatingWindowFrameResizeHandles__w').classes()).toContain(
    'faFloatingWindowFrameResizeHandles__hit--glow'
  )
  expect(w.find('.faFloatingWindowFrameResizeHandles__nw').classes()).toContain(
    'faFloatingWindowFrameResizeHandles__hit--glow'
  )

  w.unmount()
})

/**
 * FaFloatingWindowFrameResizeHandles
 * Each edge strip and corner picks up hover glow on mouseenter.
 */
test('Test that FaFloatingWindowFrameResizeHandles highlights every handle on mouseenter', async () => {
  vi.useFakeTimers()
  const w = mount(FaFloatingWindowFrameResizeHandles, {
    props: { onResizePointerDown: vi.fn() }
  })

  const expectGlow = async (selector: string): Promise<void> => {
    await w.find(selector).trigger('mouseenter')
    expect(w.find(selector).classes()).toContain('faFloatingWindowFrameResizeHandles__hit--glow')
    await w.find(selector).trigger('mouseleave')
    vi.advanceTimersByTime(50)
    await w.vm.$nextTick()
  }

  await expectGlow('.faFloatingWindowFrameResizeHandles__n')
  await expectGlow('.faFloatingWindowFrameResizeHandles__s')
  await expectGlow('.faFloatingWindowFrameResizeHandles__e')
  await expectGlow('.faFloatingWindowFrameResizeHandles__w')
  await expectGlow('.faFloatingWindowFrameResizeHandles__nw')
  await expectGlow('.faFloatingWindowFrameResizeHandles__ne')
  await expectGlow('.faFloatingWindowFrameResizeHandles__sw')
  await expectGlow('.faFloatingWindowFrameResizeHandles__se')

  vi.useRealTimers()
  w.unmount()
})

/**
 * FaFloatingWindowFrameResizeHandles
 * Edge glow clears shortly after mouseleave.
 */
test('Test that FaFloatingWindowFrameResizeHandles clears edge glow after debounced mouseleave', async () => {
  vi.useFakeTimers()
  const w = mount(FaFloatingWindowFrameResizeHandles, {
    props: { onResizePointerDown: vi.fn() }
  })

  await w.find('.faFloatingWindowFrameResizeHandles__n').trigger('mouseenter')
  expect(w.find('.faFloatingWindowFrameResizeHandles__n').classes()).toContain(
    'faFloatingWindowFrameResizeHandles__hit--glow'
  )

  await w.find('.faFloatingWindowFrameResizeHandles__n').trigger('mouseleave')
  vi.advanceTimersByTime(50)
  await w.vm.$nextTick()

  expect(w.find('.faFloatingWindowFrameResizeHandles__n').classes()).not.toContain(
    'faFloatingWindowFrameResizeHandles__hit--glow'
  )

  vi.useRealTimers()
  w.unmount()
})
