import { expect, test } from 'vitest'

import { resolveProjectHierarchyTreeDocumentAppearanceChrome } from '../projectHierarchyTreeDocumentAppearanceChromeWiring'

test('Test that resolveProjectHierarchyTreeDocumentAppearanceChrome returns undefined for non-document nodes', () => {
  expect(resolveProjectHierarchyTreeDocumentAppearanceChrome({
    documentBackgroundColor: '#112233',
    documentTextColor: '#aabbcc',
    nodeKind: 'world'
  })).toBeUndefined()
})

test('Test that resolveProjectHierarchyTreeDocumentAppearanceChrome returns undefined when document colors are empty', () => {
  expect(resolveProjectHierarchyTreeDocumentAppearanceChrome({
    documentBackgroundColor: '',
    documentTextColor: '',
    nodeKind: 'document'
  })).toBeUndefined()
})

test('Test that resolveProjectHierarchyTreeDocumentAppearanceChrome maps text-only document colors', () => {
  expect(resolveProjectHierarchyTreeDocumentAppearanceChrome({
    documentBackgroundColor: '',
    documentTextColor: '#aabbcc',
    nodeKind: 'document'
  })).toEqual({
    color: '#aabbcc'
  })
})
