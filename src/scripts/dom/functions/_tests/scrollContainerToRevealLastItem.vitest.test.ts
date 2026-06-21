/** @vitest-environment jsdom */

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { scrollContainerToRevealLastItem, scrollElementToMaxScrollTop } from '../scrollContainerToRevealLastItem'

describe('scrollElementToMaxScrollTop', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    Object.defineProperty(container, 'clientHeight', {
      configurable: true,
      value: 100
    })
    Object.defineProperty(container, 'scrollHeight', {
      configurable: true,
      value: 260
    })
    document.body.appendChild(container)
  })

  test('Test that scrollElementToMaxScrollTop sets scrollTop to the max scroll offset', () => {
    scrollElementToMaxScrollTop(container)
    expect(container.scrollTop).toBe(160)
  })

  test('Test that scrollElementToMaxScrollTop no-ops for null', () => {
    expect(() => scrollElementToMaxScrollTop(null)).not.toThrow()
  })
})

describe('scrollContainerToRevealLastItem', () => {
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

  test('Test that scrollContainerToRevealLastItem falls back to max scrollTop when no items match', () => {
    const container = document.createElement('div')
    Object.defineProperty(container, 'clientHeight', {
      configurable: true,
      value: 80
    })
    Object.defineProperty(container, 'scrollHeight', {
      configurable: true,
      value: 200
    })
    document.body.appendChild(container)

    scrollContainerToRevealLastItem(container, '.missing')

    expect(container.scrollTop).toBe(120)
  })
})
