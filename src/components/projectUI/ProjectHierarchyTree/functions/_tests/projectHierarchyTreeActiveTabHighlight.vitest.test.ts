import { expect, test } from 'vitest'

import { projectHierarchyTreeNodeShowsActiveTabHighlight } from '../projectHierarchyTreeActiveTabHighlight'

const documentNode = {
  documentId: 'doc-1',
  nodeKind: 'document' as const
}

test('Test that projectHierarchyTreeNodeShowsActiveTabHighlight is true for matching active document rows', () => {
  expect(projectHierarchyTreeNodeShowsActiveTabHighlight(documentNode, 'doc-1')).toBe(true)
})

test('Test that projectHierarchyTreeNodeShowsActiveTabHighlight is false for other open tabs', () => {
  expect(projectHierarchyTreeNodeShowsActiveTabHighlight(documentNode, 'doc-2')).toBe(false)
})

test('Test that projectHierarchyTreeNodeShowsActiveTabHighlight is false when no active tab', () => {
  expect(projectHierarchyTreeNodeShowsActiveTabHighlight(documentNode, null)).toBe(false)
})

test('Test that projectHierarchyTreeNodeShowsActiveTabHighlight ignores non-document rows', () => {
  expect(projectHierarchyTreeNodeShowsActiveTabHighlight({
    documentId: 'doc-1',
    nodeKind: 'group'
  }, 'doc-1')).toBe(false)
})

test('Test that projectHierarchyTreeNodeShowsActiveTabHighlight ignores add-new rows', () => {
  expect(projectHierarchyTreeNodeShowsActiveTabHighlight({
    documentId: null,
    nodeKind: 'addNewDocument'
  }, 'doc-1')).toBe(false)
})
