import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveProjectHierarchyTreeNodeContextMenuSectionFlags } from '../projectHierarchyTreeNodeContextMenuEligibilityWiring'

const sampleTree: I_faProjectHierarchyTreeHeTreeNode[] = [
  {
    children: [
      {
        children: [],
        childrenLoaded: true,
        documentId: null,
        groupId: 'group-1',
        hasChildren: true,
        icon: '',
        id: 'group-1',
        label: 'Group 1',
        nodeKind: 'group',
        placementId: null,
        worldColor: '#000',
        worldId: 'world-1'
      }
    ],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World 1',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
]

test('resolveProjectHierarchyTreeNodeContextMenuSectionFlags returns bulk flags for structural rows', () => {
  const flags = resolveProjectHierarchyTreeNodeContextMenuSectionFlags(sampleTree[0]!, sampleTree)
  expect(flags).toEqual({
    showsBulkExpandRows: true,
    showsCopyRows: false
  })
})

test('resolveProjectHierarchyTreeNodeContextMenuSectionFlags returns copy flags for document rows', () => {
  const documentNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-leaf',
    groupId: 'group-1',
    hasChildren: false,
    icon: '',
    id: 'doc-leaf',
    label: 'Leaf',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const flags = resolveProjectHierarchyTreeNodeContextMenuSectionFlags(documentNode, sampleTree)
  expect(flags).toEqual({
    showsBulkExpandRows: false,
    showsCopyRows: true
  })
})

test('resolveProjectHierarchyTreeNodeContextMenuSectionFlags returns null for ineligible rows', () => {
  const addNewNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'add-new',
    label: 'Add new',
    nodeKind: 'addNewDocument',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(resolveProjectHierarchyTreeNodeContextMenuSectionFlags(addNewNode, sampleTree)).toBeNull()
})
