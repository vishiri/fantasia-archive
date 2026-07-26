/** @vitest-environment jsdom */

/**
 * createFaVerticalDraggableTabListPointerHoverWiring
 */
import { afterEach, expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { createFaVerticalDraggableTabListPointerHoverWiring } from '../faVerticalDraggableTabListPointerHoverWiring'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function buildTabElement (id: string): HTMLElement {
  const tab = document.createElement('div')
  tab.className = 'faVerticalDraggableTabs__tab'
  tab.setAttribute('data-test-world-id', id)
  return tab
}

test('Test that pointer move sets hover id from tab target', () => {
  const root = document.createElement('div')
  const tab = buildTabElement('world-a')
  root.appendChild(tab)
  const draggingItemId = ref<string | null>(null)
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId,
    elementFromPoint: () => null,
    getRoot: () => root,
    getScroll: () => root,
    readDragItemId: (item, attr) => item.getAttribute(attr),
    resolveTabIdUnderPoint: () => null,
    sortableAnimationMs: 150
  })

  wiring.onTabListPointerMove({
    clientX: 5,
    clientY: 6,
    target: tab
  } as unknown as PointerEvent)

  expect(wiring.pointerHoverItemId.value).toBe('world-a')
})

test('Test that pointer move clears hover when dragging', () => {
  const root = document.createElement('div')
  const tab = buildTabElement('world-a')
  root.appendChild(tab)
  const draggingItemId = ref<string | null>('world-b')
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId,
    elementFromPoint: () => null,
    getRoot: () => root,
    getScroll: () => root,
    readDragItemId: (item, attr) => item.getAttribute(attr),
    resolveTabIdUnderPoint: () => 'should-not-apply',
    sortableAnimationMs: 150
  })
  wiring.pointerHoverItemId.value = 'world-a'

  wiring.onTabListPointerMove({
    clientX: 1,
    clientY: 1,
    target: tab
  } as unknown as PointerEvent)

  expect(wiring.pointerHoverItemId.value).toBe('world-a')
})

test('Test that pointer move clears hover for non-element target', () => {
  const draggingItemId = ref<string | null>(null)
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId,
    elementFromPoint: () => null,
    getRoot: () => document.createElement('div'),
    getScroll: () => null,
    readDragItemId: () => 'x',
    resolveTabIdUnderPoint: () => null,
    sortableAnimationMs: 150
  })
  wiring.pointerHoverItemId.value = 'world-a'

  wiring.onTabListPointerMove({
    clientX: 0,
    clientY: 0,
    target: null
  } as unknown as PointerEvent)

  expect(wiring.pointerHoverItemId.value).toBeNull()
})

test('Test that pointer move clears hover when target is not a tab', () => {
  const root = document.createElement('div')
  const nonTab = document.createElement('span')
  root.appendChild(nonTab)
  const draggingItemId = ref<string | null>(null)
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId,
    elementFromPoint: () => null,
    getRoot: () => root,
    getScroll: () => root,
    readDragItemId: () => 'x',
    resolveTabIdUnderPoint: () => null,
    sortableAnimationMs: 150
  })
  wiring.pointerHoverItemId.value = 'world-a'

  wiring.onTabListPointerMove({
    clientX: 0,
    clientY: 0,
    target: nonTab
  } as unknown as PointerEvent)

  expect(wiring.pointerHoverItemId.value).toBeNull()
})

test('Test that pointer move clears hover when tab is outside root', () => {
  const root = document.createElement('div')
  const outsideTab = buildTabElement('world-out')
  const draggingItemId = ref<string | null>(null)
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId,
    elementFromPoint: () => null,
    getRoot: () => root,
    getScroll: () => root,
    readDragItemId: () => 'world-out',
    resolveTabIdUnderPoint: () => null,
    sortableAnimationMs: 150
  })
  wiring.pointerHoverItemId.value = 'world-a'

  wiring.onTabListPointerMove({
    clientX: 0,
    clientY: 0,
    target: outsideTab
  } as unknown as PointerEvent)

  expect(wiring.pointerHoverItemId.value).toBeNull()
})

test('Test that pointer leave keeps hover when related target stays in scroll', () => {
  const scroll = document.createElement('div')
  const related = document.createElement('div')
  scroll.appendChild(related)
  const draggingItemId = ref<string | null>(null)
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId,
    elementFromPoint: () => null,
    getRoot: () => scroll,
    getScroll: () => scroll,
    readDragItemId: () => null,
    resolveTabIdUnderPoint: () => null,
    sortableAnimationMs: 150
  })
  wiring.pointerHoverItemId.value = 'world-a'

  wiring.onTabListPointerLeave({
    relatedTarget: related
  } as unknown as PointerEvent)

  expect(wiring.pointerHoverItemId.value).toBe('world-a')
})

test('Test that pointer leave clears hover when leaving scroll', () => {
  const scroll = document.createElement('div')
  const draggingItemId = ref<string | null>(null)
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId,
    elementFromPoint: () => null,
    getRoot: () => scroll,
    getScroll: () => scroll,
    readDragItemId: () => null,
    resolveTabIdUnderPoint: () => null,
    sortableAnimationMs: 150
  })
  wiring.pointerHoverItemId.value = 'world-a'

  wiring.onTabListPointerLeave({
    relatedTarget: document.createElement('div')
  } as unknown as PointerEvent)

  expect(wiring.pointerHoverItemId.value).toBeNull()
})

test('Test that schedulePointerHoverResyncAfterAnimation restores hover from last point', () => {
  vi.useFakeTimers()
  const root = document.createElement('div')
  const draggingItemId = ref<string | null>(null)
  const resolveTabIdUnderPoint = vi.fn(() => 'world-resync')
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId,
    elementFromPoint: () => null,
    getRoot: () => root,
    getScroll: () => root,
    readDragItemId: () => null,
    resolveTabIdUnderPoint,
    sortableAnimationMs: 150
  })
  wiring.pointerHoverItemId.value = 'world-stale'
  wiring.onTabListPointerMove({
    clientX: 11,
    clientY: 22,
    target: null
  } as unknown as PointerEvent)

  wiring.schedulePointerHoverResyncAfterAnimation()
  expect(wiring.pointerHoverItemId.value).toBeNull()

  vi.advanceTimersByTime(150)
  expect(resolveTabIdUnderPoint).toHaveBeenCalledWith(expect.objectContaining({
    clientX: 11,
    clientY: 22,
    root
  }))
  expect(wiring.pointerHoverItemId.value).toBe('world-resync')
})

test('Test that schedulePointerHoverResync clears hover when dragging after timeout', () => {
  vi.useFakeTimers()
  const root = document.createElement('div')
  const draggingItemId = ref<string | null>(null)
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId,
    elementFromPoint: () => null,
    getRoot: () => root,
    getScroll: () => root,
    readDragItemId: () => null,
    resolveTabIdUnderPoint: () => 'world-x',
    sortableAnimationMs: 100
  })
  wiring.schedulePointerHoverResyncAfterAnimation()
  draggingItemId.value = 'world-drag'

  vi.advanceTimersByTime(100)
  expect(wiring.pointerHoverItemId.value).toBeNull()
})

test('Test that cancelPointerHoverResync prevents delayed hover restore', () => {
  vi.useFakeTimers()
  const root = document.createElement('div')
  const resolveTabIdUnderPoint = vi.fn(() => 'world-late')
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId: ref(null),
    elementFromPoint: () => null,
    getRoot: () => root,
    getScroll: () => root,
    readDragItemId: () => null,
    resolveTabIdUnderPoint,
    sortableAnimationMs: 150
  })
  wiring.schedulePointerHoverResyncAfterAnimation()
  wiring.cancelPointerHoverResync()
  vi.advanceTimersByTime(150)

  expect(resolveTabIdUnderPoint).not.toHaveBeenCalled()
  expect(wiring.pointerHoverItemId.value).toBeNull()
})

test('Test that clearPointerHover clears the hover id', () => {
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId: ref(null),
    elementFromPoint: () => null,
    getRoot: () => null,
    getScroll: () => null,
    readDragItemId: () => null,
    resolveTabIdUnderPoint: () => null,
    sortableAnimationMs: 150
  })
  wiring.pointerHoverItemId.value = 'world-a'
  wiring.clearPointerHover()
  expect(wiring.pointerHoverItemId.value).toBeNull()
})

test('Test that cancelPointerHoverResync is a no-op without a pending timeout', () => {
  const wiring = createFaVerticalDraggableTabListPointerHoverWiring({
    dragIdDataAttribute: () => 'data-test-world-id',
    draggingItemId: ref(null),
    elementFromPoint: () => null,
    getRoot: () => null,
    getScroll: () => null,
    readDragItemId: () => null,
    resolveTabIdUnderPoint: () => null,
    sortableAnimationMs: 150
  })
  expect(() => {
    wiring.cancelPointerHoverResync()
  }).not.toThrow()
})
