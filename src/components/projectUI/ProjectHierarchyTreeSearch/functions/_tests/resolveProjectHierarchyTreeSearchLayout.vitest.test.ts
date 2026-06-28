import { expect, test } from 'vitest'

import { resolveProjectHierarchyTreeSearchLayout } from '../resolveProjectHierarchyTreeSearchLayout'

test('Test that resolveProjectHierarchyTreeSearchLayout returns fullViewport when focused', () => {
  expect(resolveProjectHierarchyTreeSearchLayout({
    disableDocumentControlBar: false,
    isFocused: true
  })).toBe('fullViewport')
  expect(resolveProjectHierarchyTreeSearchLayout({
    disableDocumentControlBar: true,
    isFocused: true
  })).toBe('fullViewport')
})

test('Test that resolveProjectHierarchyTreeSearchLayout returns followSidebar when bar is hidden and unfocused', () => {
  expect(resolveProjectHierarchyTreeSearchLayout({
    disableDocumentControlBar: true,
    isFocused: false
  })).toBe('followSidebar')
})

test('Test that resolveProjectHierarchyTreeSearchLayout returns fixed375 when bar is shown and unfocused', () => {
  expect(resolveProjectHierarchyTreeSearchLayout({
    disableDocumentControlBar: false,
    isFocused: false
  })).toBe('fixed375')
})
