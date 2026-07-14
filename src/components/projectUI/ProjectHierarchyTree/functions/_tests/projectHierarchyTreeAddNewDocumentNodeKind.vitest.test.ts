import { expect, test } from 'vitest'

import {
  isProjectHierarchyTreeAddNewDocumentCreateSourceNode,
  isProjectHierarchyTreeAddNewDocumentNode,
  resolveProjectHierarchyTreeAddNewDocumentNodeId
} from '../projectHierarchyTreeAddNewDocumentNodeKind'

test('resolveProjectHierarchyTreeAddNewDocumentNodeId is stable per placement', () => {
  expect(resolveProjectHierarchyTreeAddNewDocumentNodeId('placement-1')).toBe('placement-1__add-new')
})

test('isProjectHierarchyTreeAddNewDocumentNode matches nodeKind and id suffix', () => {
  expect(isProjectHierarchyTreeAddNewDocumentNode({
    id: 'placement-1__add-new',
    nodeKind: 'addNewDocument'
  })).toBe(true)
  expect(isProjectHierarchyTreeAddNewDocumentNode({
    id: 'placement-1__add-new',
    nodeKind: 'document'
  })).toBe(true)
  expect(isProjectHierarchyTreeAddNewDocumentNode({
    id: 'doc-1',
    nodeKind: 'document'
  })).toBe(false)
})

test('isProjectHierarchyTreeAddNewDocumentCreateSourceNode includes template placements', () => {
  expect(isProjectHierarchyTreeAddNewDocumentCreateSourceNode({
    id: 'placement-1',
    nodeKind: 'templatePlacement'
  })).toBe(true)
})
