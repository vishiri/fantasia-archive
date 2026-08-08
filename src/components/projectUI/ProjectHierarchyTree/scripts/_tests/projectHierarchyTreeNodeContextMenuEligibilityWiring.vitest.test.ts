import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveProjectHierarchyTreeNodeContextMenuSectionFlags } from '../projectHierarchyTreeNodeContextMenuWiring'

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
        tagId: null,
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
    tagId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
]

test('resolveProjectHierarchyTreeNodeContextMenuSectionFlags returns bulk flags for structural rows', () => {
  const flags = resolveProjectHierarchyTreeNodeContextMenuSectionFlags(sampleTree[0]!, sampleTree)
  expect(flags).toEqual({
    showsBulkExpandRows: true,
    showsCopyRows: false,
    showsDocumentOpenEditRows: false,
    showsSortByRows: false,
    showsTagMenuRows: false,
    sortByDirectScopeOnly: false
  })
})

test('resolveProjectHierarchyTreeNodeContextMenuSectionFlags returns copy flags for document rows', () => {
  const documentNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [
      {
        children: [],
        childrenLoaded: true,
        documentId: 'child-doc',
        groupId: null,
        hasChildren: false,
        icon: '',
        id: 'child-doc',
        label: 'Child',
        nodeKind: 'document',
        placementId: 'placement-1',
        tagId: null,
        worldColor: '#000',
        worldId: 'world-1'
      }
    ],
    childrenLoaded: true,
    documentId: 'doc-leaf',
    groupId: 'group-1',
    hasChildren: true,
    icon: '',
    id: 'doc-leaf',
    label: 'Leaf',
    nodeKind: 'document',
    placementId: 'placement-1',
    tagId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
  const flags = resolveProjectHierarchyTreeNodeContextMenuSectionFlags(documentNode, sampleTree)
  expect(flags).toEqual({
    showsBulkExpandRows: true,
    showsCopyRows: true,
    showsDocumentOpenEditRows: false,
    showsSortByRows: true,
    showsTagMenuRows: false,
    sortByDirectScopeOnly: false
  })
})

test('resolveProjectHierarchyTreeNodeContextMenuSectionFlags hides Sort by on document without document children', () => {
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
    tagId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
  const flags = resolveProjectHierarchyTreeNodeContextMenuSectionFlags(documentNode, sampleTree)
  expect(flags).toEqual({
    showsBulkExpandRows: false,
    showsCopyRows: true,
    showsDocumentOpenEditRows: false,
    showsSortByRows: false,
    showsTagMenuRows: false,
    sortByDirectScopeOnly: false
  })
})

test('resolveProjectHierarchyTreeNodeContextMenuSectionFlags returns sort flags for template placements', () => {
  const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: 'group-1',
    hasChildren: false,
    icon: '',
    id: 'placement-1',
    label: 'Type',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    tagId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
  const flags = resolveProjectHierarchyTreeNodeContextMenuSectionFlags(placementNode, sampleTree)
  expect(flags).toEqual({
    showsBulkExpandRows: false,
    showsCopyRows: false,
    showsDocumentOpenEditRows: false,
    showsSortByRows: true,
    showsTagMenuRows: false,
    sortByDirectScopeOnly: false
  })
})

test('resolveProjectHierarchyTreeNodeContextMenuSectionFlags hides Sort by when placement id is blank', () => {
  const documentNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [
      {
        children: [],
        childrenLoaded: true,
        documentId: 'child-doc',
        groupId: null,
        hasChildren: false,
        icon: '',
        id: 'child-doc',
        label: 'Child',
        nodeKind: 'document',
        placementId: '   ',
        tagId: null,
        worldColor: '#000',
        worldId: 'world-1'
      }
    ],
    childrenLoaded: true,
    documentId: 'doc-leaf',
    groupId: 'group-1',
    hasChildren: true,
    icon: '',
    id: 'doc-leaf',
    label: 'Leaf',
    nodeKind: 'document',
    placementId: '   ',
    tagId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
  const flags = resolveProjectHierarchyTreeNodeContextMenuSectionFlags(documentNode, sampleTree)
  expect(flags).toEqual({
    showsBulkExpandRows: true,
    showsCopyRows: true,
    showsDocumentOpenEditRows: false,
    showsSortByRows: false,
    showsTagMenuRows: false,
    sortByDirectScopeOnly: false
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
    tagId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(resolveProjectHierarchyTreeNodeContextMenuSectionFlags(addNewNode, sampleTree)).toBeNull()
})

test('resolveProjectHierarchyTreeNodeContextMenuSectionFlags returns tag menu for tag rows', () => {
  const tagNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: 'mdi-tag',
    id: 'tag-1',
    label: 'Heroes',
    nodeKind: 'tag',
    placementId: null,
    tagId: 'tag-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(resolveProjectHierarchyTreeNodeContextMenuSectionFlags(tagNode, sampleTree)).toEqual({
    showsBulkExpandRows: false,
    showsCopyRows: false,
    showsDocumentOpenEditRows: false,
    showsSortByRows: true,
    showsTagMenuRows: true,
    sortByDirectScopeOnly: true
  })
})
