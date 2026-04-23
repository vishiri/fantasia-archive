import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test, vi } from 'vitest'

import { useFaFloatingWindowFrameResizeHandlesHover } from '../faFloatingWindowFrameResizeHandlesHover'

const HoverHarness = defineComponent({
  setup () {
    return useFaFloatingWindowFrameResizeHandlesHover()
  },
  template: '<span />'
})

/**
 * useFaFloatingWindowFrameResizeHandlesHover
 * North-west hover lights both adjoining edges in the computed map.
 */
test('Test that useFaFloatingWindowFrameResizeHandlesHover maps north-west to north and west glow', () => {
  const w = mount(HoverHarness)
  w.vm.onHoverEnter('nw')
  expect(w.vm.edgeGlow.n).toBe(true)
  expect(w.vm.edgeGlow.w).toBe(true)
  expect(w.vm.edgeGlow.e).toBe(false)
  expect(w.vm.edgeGlow.s).toBe(false)
  w.unmount()
})

/**
 * useFaFloatingWindowFrameResizeHandlesHover
 * beginResizeHighlight without hover still drives glow until pointerup.
 */
test('Test that useFaFloatingWindowFrameResizeHandlesHover beginResizeHighlight ends on pointerup', () => {
  const w = mount(HoverHarness)
  w.vm.beginResizeHighlight('ne')
  expect(w.vm.edgeGlow.n).toBe(true)
  expect(w.vm.edgeGlow.e).toBe(true)
  window.dispatchEvent(new PointerEvent('pointerup'))
  expect(w.vm.edgeGlow.n).toBe(false)
  expect(w.vm.edgeGlow.e).toBe(false)
  w.unmount()
})

/**
 * useFaFloatingWindowFrameResizeHandlesHover
 * Resize lock keeps edge glow after debounced mouseleave clears hover source.
 */
test('Test that useFaFloatingWindowFrameResizeHandlesHover keeps glow during resize lock after mouseleave', () => {
  vi.useFakeTimers()
  const w = mount(HoverHarness)
  w.vm.onHoverEnter('n')
  w.vm.beginResizeHighlight('n')
  w.vm.onHoverLeave()
  vi.advanceTimersByTime(50)
  expect(w.vm.source).toBe(null)
  expect(w.vm.edgeGlow.n).toBe(true)
  window.dispatchEvent(new PointerEvent('pointerup'))
  expect(w.vm.edgeGlow.n).toBe(false)
  vi.useRealTimers()
  w.unmount()
})

/**
 * useFaFloatingWindowFrameResizeHandlesHover
 * Scheduled mouseleave clears hover after the debounce window.
 */
test('Test that useFaFloatingWindowFrameResizeHandlesHover debounces mouseleave', () => {
  vi.useFakeTimers()
  const w = mount(HoverHarness)
  w.vm.onHoverEnter('s')
  expect(w.vm.source).toBe('s')
  w.vm.onHoverLeave()
  vi.advanceTimersByTime(49)
  expect(w.vm.source).toBe('s')
  vi.advanceTimersByTime(1)
  expect(w.vm.source).toBe(null)
  vi.useRealTimers()
  w.unmount()
})

/**
 * useFaFloatingWindowFrameResizeHandlesHover
 * Entering a new edge clears a pending debounced leave so the prior timeout does not wipe 'source'.
 */
test('Test that useFaFloatingWindowFrameResizeHandlesHover cancels pending leave when re-entering another edge', () => {
  vi.useFakeTimers()
  const w = mount(HoverHarness)
  w.vm.onHoverEnter('s')
  w.vm.onHoverLeave()
  vi.advanceTimersByTime(20)
  w.vm.onHoverEnter('e')
  vi.advanceTimersByTime(50)
  expect(w.vm.source).toBe('e')
  vi.useRealTimers()
  w.unmount()
})
