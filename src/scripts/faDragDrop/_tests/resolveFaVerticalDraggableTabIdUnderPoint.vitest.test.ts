/**
 * resolveFaVerticalDraggableTabIdUnderPoint
 */
import { expect, test } from 'vitest'

import { resolveFaVerticalDraggableTabIdUnderPoint } from '../functions/resolveFaVerticalDraggableTabIdUnderPoint'

test('Test that resolveFaVerticalDraggableTabIdUnderPoint returns tab id under point', () => {
  const tab = {
    closest: () => tab
  } as unknown as HTMLElement
  const root = {
    contains: (node: Node) => node === tab
  } as unknown as Element

  const id = resolveFaVerticalDraggableTabIdUnderPoint({
    clientX: 10,
    clientY: 20,
    dragIdDataAttribute: 'data-test-world-id',
    elementFromPoint: () => tab,
    readDragItemId: () => 'world-a',
    root,
    tabSelector: '.faVerticalDraggableTabs__tab'
  })

  expect(id).toBe('world-a')
})

test('Test that resolveFaVerticalDraggableTabIdUnderPoint returns null outside root', () => {
  const outside = {} as Element
  const root = {
    contains: () => false
  } as unknown as Element

  const id = resolveFaVerticalDraggableTabIdUnderPoint({
    clientX: 1,
    clientY: 1,
    dragIdDataAttribute: 'data-test-world-id',
    elementFromPoint: () => outside,
    readDragItemId: () => 'should-not-run',
    root,
    tabSelector: '.faVerticalDraggableTabs__tab'
  })

  expect(id).toBeNull()
})

test('Test that resolveFaVerticalDraggableTabIdUnderPoint returns null when no element under point', () => {
  const root = {
    contains: () => true
  } as unknown as Element

  const id = resolveFaVerticalDraggableTabIdUnderPoint({
    clientX: 1,
    clientY: 1,
    dragIdDataAttribute: 'data-test-world-id',
    elementFromPoint: () => null,
    readDragItemId: () => 'should-not-run',
    root,
    tabSelector: '.faVerticalDraggableTabs__tab'
  })

  expect(id).toBeNull()
})

test('Test that resolveFaVerticalDraggableTabIdUnderPoint returns null when closest tab is outside root', () => {
  const outsideTab = {} as HTMLElement
  const hit = {
    closest: () => outsideTab
  } as unknown as Element
  const root = {
    contains: (node: Node) => node === hit
  } as unknown as Element

  const id = resolveFaVerticalDraggableTabIdUnderPoint({
    clientX: 1,
    clientY: 1,
    dragIdDataAttribute: 'data-test-world-id',
    elementFromPoint: () => hit,
    readDragItemId: () => 'should-not-run',
    root,
    tabSelector: '.faVerticalDraggableTabs__tab'
  })

  expect(id).toBeNull()
})

test('Test that resolveFaVerticalDraggableTabIdUnderPoint returns null when closest finds no tab', () => {
  const hit = {
    closest: () => null
  } as unknown as Element
  const root = {
    contains: (node: Node) => node === hit
  } as unknown as Element

  const id = resolveFaVerticalDraggableTabIdUnderPoint({
    clientX: 1,
    clientY: 1,
    dragIdDataAttribute: 'data-test-world-id',
    elementFromPoint: () => hit,
    readDragItemId: () => 'should-not-run',
    root,
    tabSelector: '.faVerticalDraggableTabs__tab'
  })

  expect(id).toBeNull()
})
