import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  resolveHierarchyTreeDocumentOpenMetaFromNode,
  resolveOpenedDocumentTreeOpenMetaForSeed
} from '../openedDocumentTreeOpenMeta'

const loadedNode: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentBackgroundColor: null,
  documentId: 'doc-a',
  documentTextColor: null,
  groupId: null,
  hasChildren: false,
  icon: 'mdi-account',
  id: 'doc-a',
  label: 'Hero',
  nodeKind: 'document',
  placementId: 'placement-1',
  tagId: null,
  worldColor: '#000000',
  worldId: 'world-1'
}

test('Test that resolveHierarchyTreeDocumentOpenMetaFromNode uses the loaded node', () => {
  expect(resolveHierarchyTreeDocumentOpenMetaFromNode(loadedNode)).toEqual({
    tabLabel: 'Hero',
    templateIcon: 'mdi-account'
  })
})

test('Test that resolveHierarchyTreeDocumentOpenMetaFromNode is blank when the node is missing', () => {
  expect(resolveHierarchyTreeDocumentOpenMetaFromNode(null)).toEqual({
    tabLabel: '',
    templateIcon: ''
  })
})

test('Test that resolveOpenedDocumentTreeOpenMetaForSeed keeps a loaded tree label and icon', () => {
  expect(resolveOpenedDocumentTreeOpenMetaForSeed({
    tabLabel: 'Hero',
    templateIcon: 'mdi-account'
  }, 'Other', 'mdi-skull')).toEqual({
    tabLabel: 'Hero',
    templateIcon: 'mdi-account'
  })
})

test('Test that resolveOpenedDocumentTreeOpenMetaForSeed fills a blank tree label and icon', () => {
  expect(resolveOpenedDocumentTreeOpenMetaForSeed({
    tabLabel: '   ',
    templateIcon: ''
  }, 'Villain', 'mdi-skull')).toEqual({
    tabLabel: 'Villain',
    templateIcon: 'mdi-skull'
  })
})
