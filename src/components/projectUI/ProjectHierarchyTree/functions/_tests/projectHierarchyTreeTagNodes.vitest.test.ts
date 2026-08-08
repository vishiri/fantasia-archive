import { expect, test } from 'vitest'

import {
  isProjectHierarchyTreeDocumentUnderTagNode,
  mapProjectHierarchyTreeDocumentsUnderTagToNodes,
  mergeProjectHierarchyTreeWorldChildrenWithTags,
  resolveProjectHierarchyTreeDocumentUnderTagNodeId,
  resolveProjectHierarchyTreeTagRenameMergeConflict,
  resolveProjectHierarchyTreeTagWrapperNodeId,
  sortProjectHierarchyTreeWorkspaceTagsAlphabetically
} from '../projectHierarchyTreeTagNodes'

test('sortProjectHierarchyTreeWorkspaceTagsAlphabetically sorts by name then id', () => {
  const sorted = sortProjectHierarchyTreeWorkspaceTagsAlphabetically([
    {
      categoryCount: 0,
      documentCount: 1,
      id: 'b',
      name: 'Zeta'
    },
    {
      categoryCount: 0,
      documentCount: 0,
      id: 'a',
      name: 'alpha'
    },
    {
      categoryCount: 0,
      documentCount: 2,
      id: 'c',
      name: 'Alpha'
    }
  ])
  expect(sorted.map((tag) => tag.id)).toEqual(['a', 'c', 'b'])
})

test('resolveProjectHierarchyTreeDocumentUnderTagNodeId builds stable mirror id', () => {
  expect(resolveProjectHierarchyTreeDocumentUnderTagNodeId('tag-1', 'doc-1')).toBe('tag-1__doc__doc-1')
})

test('resolveProjectHierarchyTreeTagWrapperNodeId builds wrapper id', () => {
  expect(resolveProjectHierarchyTreeTagWrapperNodeId('world-1')).toBe('world-1__tagWrapper')
})

test('mergeProjectHierarchyTreeWorldChildrenWithTags respects tagsAtTop', () => {
  const structural = [{ id: 'placement' }] as never
  const tags = [{ id: 'tag' }] as never
  expect(mergeProjectHierarchyTreeWorldChildrenWithTags({
    structuralChildren: structural,
    tagBranchNodes: tags,
    tagsAtTop: true
  }).map((node: { id: string }) => node.id)).toEqual(['tag', 'placement'])
  expect(mergeProjectHierarchyTreeWorldChildrenWithTags({
    structuralChildren: structural,
    tagBranchNodes: tags,
    tagsAtTop: false
  }).map((node: { id: string }) => node.id)).toEqual(['placement', 'tag'])
})

test('mapProjectHierarchyTreeDocumentsUnderTagToNodes maps flat mirror docs', () => {
  const nodes = mapProjectHierarchyTreeDocumentsUnderTagToNodes({
    items: [
      {
        documentBackgroundColor: '',
        documentId: 'doc-2',
        documentTextColor: '',
        displayName: 'B',
        extraClasses: '',
        isCategory: false,
        isDead: false,
        isFinished: false,
        isMinor: false,
        sortOrder: 1,
        templateId: null,
        treeOrderNumber: 0
      },
      {
        documentBackgroundColor: '',
        documentId: 'doc-1',
        documentTextColor: '',
        displayName: 'A',
        extraClasses: '',
        isCategory: false,
        isDead: false,
        isFinished: false,
        isMinor: false,
        sortOrder: 0,
        templateId: null,
        treeOrderNumber: 0
      }
    ],
    resolvePlacementDisplayIcon: (icon) => icon || 'mdi-file-outline',
    tagId: 'tag-1',
    worldColor: '#111',
    worldId: 'world-1'
  })
  expect(nodes.map((node) => node.documentId)).toEqual(['doc-1', 'doc-2'])
  expect(nodes[0]?.id).toBe('tag-1__doc__doc-1')
  expect(nodes[0]?.tagId).toBe('tag-1')
  expect(nodes[0]?.hasChildren).toBe(false)
})

test('isProjectHierarchyTreeDocumentUnderTagNode detects tag mirrors', () => {
  expect(isProjectHierarchyTreeDocumentUnderTagNode({
    nodeKind: 'document',
    tagId: 'tag-1'
  })).toBe(true)
  expect(isProjectHierarchyTreeDocumentUnderTagNode({
    nodeKind: 'document',
    tagId: null
  })).toBe(false)
})

test('resolveProjectHierarchyTreeTagRenameMergeConflict detects case-insensitive clash', () => {
  expect(resolveProjectHierarchyTreeTagRenameMergeConflict({
    existingTagNames: ['Heroes', 'Places'],
    newName: 'heroes',
    renameTagCurrentName: 'Villains',
    renameTagId: 'tag-2'
  })).toBe(true)
  expect(resolveProjectHierarchyTreeTagRenameMergeConflict({
    existingTagNames: ['Heroes'],
    newName: 'Heroes',
    renameTagCurrentName: 'Heroes',
    renameTagId: 'tag-1'
  })).toBe(false)
})
