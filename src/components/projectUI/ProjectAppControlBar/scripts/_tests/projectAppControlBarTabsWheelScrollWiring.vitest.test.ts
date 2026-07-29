import { expect, test, vi } from 'vitest'

import { onProjectAppControlBarTabsWheel } from '../projectAppControlBarTabsWheelScrollWiring'

test('Test that onProjectAppControlBarTabsWheel scrolls q-tabs content from vertical wheel', () => {
  const content = document.createElement('div')
  content.className = 'q-tabs__content'
  Object.defineProperty(content, 'clientWidth', {
    configurable: true,
    value: 100
  })
  Object.defineProperty(content, 'scrollWidth', {
    configurable: true,
    value: 400
  })
  content.scrollLeft = 20

  const root = document.createElement('div')
  root.appendChild(content)

  const preventDefault = vi.fn()
  const event = {
    currentTarget: root,
    deltaX: 0,
    deltaY: 40,
    preventDefault
  } as unknown as WheelEvent

  onProjectAppControlBarTabsWheel(event)

  expect(preventDefault).toHaveBeenCalledTimes(1)
  expect(content.scrollLeft).toBe(60)
})

test('Test that onProjectAppControlBarTabsWheel ignores wheel when tabs do not overflow', () => {
  const content = document.createElement('div')
  content.className = 'q-tabs__content'
  Object.defineProperty(content, 'clientWidth', {
    configurable: true,
    value: 200
  })
  Object.defineProperty(content, 'scrollWidth', {
    configurable: true,
    value: 200
  })
  content.scrollLeft = 0

  const root = document.createElement('div')
  root.appendChild(content)

  const preventDefault = vi.fn()
  onProjectAppControlBarTabsWheel({
    currentTarget: root,
    deltaX: 0,
    deltaY: 30,
    preventDefault
  } as unknown as WheelEvent)

  expect(preventDefault).not.toHaveBeenCalled()
  expect(content.scrollLeft).toBe(0)
})

test('Test that onProjectAppControlBarTabsWheel ignores non-element targets and missing content', () => {
  const preventDefault = vi.fn()
  onProjectAppControlBarTabsWheel({
    currentTarget: null,
    deltaX: 0,
    deltaY: 30,
    preventDefault
  } as unknown as WheelEvent)
  expect(preventDefault).not.toHaveBeenCalled()

  onProjectAppControlBarTabsWheel({
    currentTarget: document.createElement('div'),
    deltaX: 0,
    deltaY: 30,
    preventDefault
  } as unknown as WheelEvent)
  expect(preventDefault).not.toHaveBeenCalled()
})
