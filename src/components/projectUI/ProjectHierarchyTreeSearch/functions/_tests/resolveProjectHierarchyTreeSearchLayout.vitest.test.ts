import { expect, test } from 'vitest'

import { resolveProjectHierarchyTreeSearchLayout } from '../resolveProjectHierarchyTreeSearchLayout'

test('Test that resolveProjectHierarchyTreeSearchLayout returns fullViewport when focused', () => {
  expect(resolveProjectHierarchyTreeSearchLayout({
    disableAppControlBar: false,
    isFocused: true
  })).toBe('fullViewport')
  expect(resolveProjectHierarchyTreeSearchLayout({
    disableAppControlBar: true,
    isFocused: true
  })).toBe('fullViewport')
})

test('Test that resolveProjectHierarchyTreeSearchLayout returns followSidebar when bar is hidden and unfocused', () => {
  expect(resolveProjectHierarchyTreeSearchLayout({
    disableAppControlBar: true,
    isFocused: false
  })).toBe('followSidebar')
})

test('Test that resolveProjectHierarchyTreeSearchLayout returns fixed375 when bar is shown and unfocused', () => {
  expect(resolveProjectHierarchyTreeSearchLayout({
    disableAppControlBar: false,
    isFocused: false
  })).toBe('fixed375')
})
