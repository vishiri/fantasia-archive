import { expect, test } from 'vitest'

import { shouldReloadProjectHierarchyTreeNodeChildren } from '../projectHierarchyTreeLazyLoadChildReload'

test('Test that shouldReloadProjectHierarchyTreeNodeChildren reloads unloaded placement rows', () => {
  expect(shouldReloadProjectHierarchyTreeNodeChildren({
    children: [],
    childrenLoaded: false,
    hasChildren: true,
    nodeKind: 'templatePlacement'
  })).toBe(true)
})

test('Test that shouldReloadProjectHierarchyTreeNodeChildren reloads stale loaded rows without document children', () => {
  expect(shouldReloadProjectHierarchyTreeNodeChildren({
    children: [],
    childrenLoaded: true,
    hasChildren: true,
    nodeKind: 'templatePlacement'
  })).toBe(true)
})

test('Test that shouldReloadProjectHierarchyTreeNodeChildren skips loaded placement rows with add-new child', () => {
  expect(shouldReloadProjectHierarchyTreeNodeChildren({
    children: [
      {
        children: [],
        childrenLoaded: false,
        documentId: null,
        groupId: null,
        hasChildren: false,
        icon: '',
        id: 'add-new-placement-1',
        label: 'Add new',
        nodeKind: 'addNewDocument',
        placementId: 'placement-1',
        worldColor: '#000',
        worldId: 'world-1'
      }
    ],
    childrenLoaded: true,
    hasChildren: true,
    nodeKind: 'templatePlacement'
  })).toBe(false)
})

test('Test that shouldReloadProjectHierarchyTreeNodeChildren skips loaded leaf rows without children', () => {
  expect(shouldReloadProjectHierarchyTreeNodeChildren({
    children: [],
    childrenLoaded: true,
    hasChildren: false,
    nodeKind: 'document'
  })).toBe(false)
})

test('Test that shouldReloadProjectHierarchyTreeNodeChildren skips non-lazy-load node kinds', () => {
  expect(shouldReloadProjectHierarchyTreeNodeChildren({
    children: [],
    childrenLoaded: true,
    hasChildren: true,
    nodeKind: 'group'
  })).toBe(false)
})

test('Test that shouldReloadProjectHierarchyTreeNodeChildren skips loaded rows with document children', () => {
  expect(shouldReloadProjectHierarchyTreeNodeChildren({
    children: [
      {
        children: [],
        childrenLoaded: false,
        documentId: 'doc-child',
        groupId: null,
        hasChildren: false,
        icon: '',
        id: 'doc-child',
        label: 'Child',
        nodeKind: 'document',
        placementId: 'placement-1',
        worldColor: '#000',
        worldId: 'world-1'
      }
    ],
    childrenLoaded: true,
    hasChildren: true,
    nodeKind: 'document'
  })).toBe(false)
})
