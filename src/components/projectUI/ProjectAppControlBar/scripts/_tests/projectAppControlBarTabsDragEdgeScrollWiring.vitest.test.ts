import { afterEach, expect, test, vi } from 'vitest'

import {
  startProjectAppControlBarTabsDragEdgeScroll,
  stopProjectAppControlBarTabsDragEdgeScroll
} from '../projectAppControlBarTabsDragEdgeScrollWiring'

afterEach(() => {
  stopProjectAppControlBarTabsDragEdgeScroll()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function createOverflowTabsRoot (scrollLeft: number): {
  content: HTMLElement
  root: HTMLElement
} {
  const content = document.createElement('div')
  content.className = 'q-tabs__content'
  Object.defineProperty(content, 'clientWidth', {
    configurable: true,
    value: 200
  })
  Object.defineProperty(content, 'scrollWidth', {
    configurable: true,
    value: 800
  })
  content.scrollLeft = scrollLeft
  content.getBoundingClientRect = () => ({
    x: 100,
    y: 0,
    width: 200,
    height: 40,
    top: 0,
    left: 100,
    right: 300,
    bottom: 40,
    toJSON: () => ({})
  })

  const root = document.createElement('div')
  root.appendChild(content)
  return {
    content,
    root
  }
}

test('Test that startProjectAppControlBarTabsDragEdgeScroll scrolls q-tabs content on animation frames', () => {
  vi.useFakeTimers()
  vi.spyOn(performance, 'now').mockReturnValue(0)

  const { content, root } = createOverflowTabsRoot(80)
  startProjectAppControlBarTabsDragEdgeScroll(root, 105)

  vi.spyOn(performance, 'now').mockReturnValue(16)
  vi.advanceTimersByTime(16)

  expect(content.scrollLeft).toBeLessThan(80)
})

test('Test that stopProjectAppControlBarTabsDragEdgeScroll clears animation-frame scroll', () => {
  vi.useFakeTimers()
  vi.spyOn(performance, 'now').mockReturnValue(0)

  const { content, root } = createOverflowTabsRoot(80)
  startProjectAppControlBarTabsDragEdgeScroll(root, 105)
  stopProjectAppControlBarTabsDragEdgeScroll()

  vi.spyOn(performance, 'now').mockReturnValue(48)
  vi.advanceTimersByTime(48)

  expect(content.scrollLeft).toBe(80)
})

test('Test that startProjectAppControlBarTabsDragEdgeScroll no-ops without root or content', () => {
  vi.useFakeTimers()
  startProjectAppControlBarTabsDragEdgeScroll(null)
  startProjectAppControlBarTabsDragEdgeScroll(undefined)
  startProjectAppControlBarTabsDragEdgeScroll(document.createElement('div'), 105)
  vi.advanceTimersByTime(32)
  expect(true).toBe(true)
})

test('Test that drag edge scroll updates from pointermove and skips mid-strip frames', () => {
  vi.useFakeTimers()
  vi.spyOn(performance, 'now').mockReturnValue(0)

  const { content, root } = createOverflowTabsRoot(80)
  startProjectAppControlBarTabsDragEdgeScroll(root)

  document.dispatchEvent(new PointerEvent('pointermove', {
    clientX: 200
  }))
  vi.spyOn(performance, 'now').mockReturnValue(16)
  vi.advanceTimersByTime(16)
  expect(content.scrollLeft).toBe(80)

  document.dispatchEvent(new PointerEvent('pointermove', {
    clientX: 105
  }))
  vi.spyOn(performance, 'now').mockReturnValue(32)
  vi.advanceTimersByTime(16)
  expect(content.scrollLeft).toBeLessThan(80)
})

test('Test that drag edge scroll ignores zero-elapsed frames before pointer sample', () => {
  vi.useFakeTimers()
  vi.spyOn(performance, 'now').mockReturnValue(10)

  const { content, root } = createOverflowTabsRoot(80)
  startProjectAppControlBarTabsDragEdgeScroll(root)
  vi.advanceTimersByTime(16)
  expect(content.scrollLeft).toBe(80)
})

test('Test that drag edge scroll carries sub-pixel deltas near zone edge', () => {
  vi.useFakeTimers()
  vi.spyOn(performance, 'now').mockReturnValue(0)

  const { content, root } = createOverflowTabsRoot(80)
  startProjectAppControlBarTabsDragEdgeScroll(root, 105)

  vi.spyOn(performance, 'now').mockReturnValue(1)
  vi.advanceTimersByTime(1)
  expect(content.scrollLeft).toBe(80)

  vi.spyOn(performance, 'now').mockReturnValue(17)
  vi.advanceTimersByTime(16)
  expect(content.scrollLeft).toBeLessThan(80)
})

test('Test that drag edge scroll raf ignores stale sessions after stop', () => {
  const rafCallbacks: FrameRequestCallback[] = []
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    rafCallbacks.push(callback)
    return rafCallbacks.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
  vi.spyOn(performance, 'now').mockReturnValue(0)

  const { root } = createOverflowTabsRoot(80)
  startProjectAppControlBarTabsDragEdgeScroll(root, 105)
  expect(rafCallbacks.length).toBe(1)
  stopProjectAppControlBarTabsDragEdgeScroll()

  rafCallbacks[0]?.(16)
  expect(rafCallbacks.length).toBe(1)
})
