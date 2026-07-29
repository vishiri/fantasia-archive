/** @vitest-environment jsdom */

import { expect, test, vi } from 'vitest'

import {
  scheduleScrollContainerToRevealLastItem,
  scrollContainerToRevealLastItem,
  scrollElementToMaxScrollTop
} from '../scrollContainerToRevealLastItem'

function createScrollableContainer (clientHeight: number, scrollHeight: number): HTMLDivElement {
  const container = document.createElement('div')
  Object.defineProperty(container, 'clientHeight', {
    configurable: true,
    value: clientHeight
  })
  Object.defineProperty(container, 'scrollHeight', {
    configurable: true,
    value: scrollHeight
  })
  document.body.appendChild(container)
  return container
}

/**
 * scrollElementToMaxScrollTop
 * Sets scrollTop to the max scroll offset.
 */
test('Test that scrollElementToMaxScrollTop sets scrollTop to the max scroll offset', () => {
  const container = createScrollableContainer(100, 260)
  scrollElementToMaxScrollTop(container)
  expect(container.scrollTop).toBe(160)
})

/**
 * scrollElementToMaxScrollTop
 * No-ops for null.
 */
test('Test that scrollElementToMaxScrollTop no-ops for null', () => {
  expect(() => scrollElementToMaxScrollTop(null)).not.toThrow()
})

/**
 * scrollContainerToRevealLastItem
 * Scrolls the last matched item into view.
 */
test('Test that scrollContainerToRevealLastItem scrolls the last matched item into view', () => {
  const container = document.createElement('div')
  const first = document.createElement('div')
  first.className = 'item'
  const last = document.createElement('div')
  last.className = 'item'
  const scrollIntoView = vi.fn()
  last.scrollIntoView = scrollIntoView
  container.append(first, last)
  document.body.appendChild(container)

  scrollContainerToRevealLastItem(container, '.item')

  expect(scrollIntoView).toHaveBeenCalledTimes(1)
  expect(scrollIntoView).toHaveBeenCalledWith({
    block: 'end',
    inline: 'nearest'
  })
})

/**
 * scrollContainerToRevealLastItem
 * Falls back to max scrollTop when no items match.
 */
test('Test that scrollContainerToRevealLastItem falls back to max scrollTop when no items match', () => {
  const container = createScrollableContainer(80, 200)

  scrollContainerToRevealLastItem(container, '.missing')

  expect(container.scrollTop).toBe(120)
})

/**
 * scrollContainerToRevealLastItem
 * No-ops for null container.
 */
test('Test that scrollContainerToRevealLastItem no-ops for null container', () => {
  expect(() => scrollContainerToRevealLastItem(null, '.item')).not.toThrow()
})

/**
 * scheduleScrollContainerToRevealLastItem
 * Reveals the last item after tick and animation frames.
 */
test('Test that scheduleScrollContainerToRevealLastItem reveals the last item after tick and animation frames', async () => {
  const container = document.createElement('div')
  const item = document.createElement('div')
  item.className = 'item'
  const scrollIntoView = vi.fn()
  item.scrollIntoView = scrollIntoView
  container.append(item)
  document.body.appendChild(container)

  const rafCallbacks: FrameRequestCallback[] = []
  const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    rafCallbacks.push(callback)
    return rafCallbacks.length
  })

  scheduleScrollContainerToRevealLastItem({
    getContainer: () => container,
    itemSelector: '.item',
    nextTick: async () => {},
    requestAnimationFrame
  })

  expect(rafCallbacks).toHaveLength(0)
  await Promise.resolve()
  expect(requestAnimationFrame).toHaveBeenCalledTimes(1)

  rafCallbacks[0]!?.(0)
  expect(scrollIntoView).toHaveBeenCalledTimes(1)
  expect(requestAnimationFrame).toHaveBeenCalledTimes(2)

  rafCallbacks[1]!?.(0)
  expect(scrollIntoView).toHaveBeenCalledTimes(2)
})
