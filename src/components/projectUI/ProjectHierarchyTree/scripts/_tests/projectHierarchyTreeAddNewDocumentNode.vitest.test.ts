import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  appendOrRefreshProjectHierarchyTreeAddNewDocumentNode,
  ensureProjectHierarchyTreeAddNewNodePinnedToBottom,
  finalizeProjectHierarchyTreePlacementTopLevelChildren,
  isProjectHierarchyTreeAddNewDocumentNode,
  PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_ICON,
  refreshProjectHierarchyTreeAddNewDocumentLabelsInTree,
  resolveProjectHierarchyTreeAddNewDocumentNodeId
} from '../projectHierarchyTreeAddNewDocumentNode'

function createPlacementSource (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: false,
    documentId: null,
    documentTemplateId: 'template-1',
    groupId: null,
    hasChildren: true,
    icon: 'mdi-file-outline',
    id: 'placement-1',
    label: 'Characters',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    titlePluralTranslations: { 'en-US': 'Characters' },
    titleSingularTranslations: { 'en-US': 'Character' },
    worldColor: '#336699',
    worldId: 'world-1'
  }
}

/**
 * resolveProjectHierarchyTreeAddNewDocumentNodeId
 * Add-new node id is stable per placement.
 */
test('Test that add-new node id is stable per placement', () => {
  expect(resolveProjectHierarchyTreeAddNewDocumentNodeId('placement-1')).toBe('placement-1__add-new')
})

/**
 * finalizeProjectHierarchyTreePlacementTopLevelChildren
 * Appends add-new as last child for empty placement bucket.
 */
test('Test that finalize appends add-new as last child for empty placement bucket', () => {
  const children = finalizeProjectHierarchyTreePlacementTopLevelChildren({
    children: [],
    placement: createPlacementSource(),
    preferredLanguageCode: 'en-US'
  })
  expect(children).toHaveLength(1)
  expect(children[0]?.nodeKind).toBe('addNewDocument')
  expect(children[0]?.label).toBe('Add new character')
  expect(children[0]?.icon).toBe(PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_ICON)
})

/**
 * ensureProjectHierarchyTreeAddNewNodePinnedToBottom
 * Moves add-new to bottom when it is not last.
 */
test('Test that ensure pinned moves add-new to bottom', () => {
  const placement = createPlacementSource()
  const children: I_faProjectHierarchyTreeHeTreeNode[] = [
    {
      children: [],
      childrenLoaded: false,
      documentId: 'doc-a',
      groupId: null,
      hasChildren: false,
      icon: 'mdi-file-outline',
      id: 'doc-a',
      label: 'Alpha',
      nodeKind: 'document',
      placementId: 'placement-1',
      worldColor: '#336699',
      worldId: 'world-1'
    }
  ]
  appendOrRefreshProjectHierarchyTreeAddNewDocumentNode({
    children,
    placement,
    preferredLanguageCode: 'en-US'
  })
  children.unshift(children.pop()!)
  const moved = ensureProjectHierarchyTreeAddNewNodePinnedToBottom(children)
  expect(moved).toBe(true)
  expect(isProjectHierarchyTreeAddNewDocumentNode(children[children.length - 1]!)).toBe(true)
})

/**
 * appendOrRefreshProjectHierarchyTreeAddNewDocumentNode
 * Updates existing add-new node labels.
 */
test('Test that appendOrRefresh updates existing add-new node labels', () => {
  const placement = createPlacementSource()
  const children: I_faProjectHierarchyTreeHeTreeNode[] = []
  appendOrRefreshProjectHierarchyTreeAddNewDocumentNode({
    children,
    placement,
    preferredLanguageCode: 'en-US'
  })
  appendOrRefreshProjectHierarchyTreeAddNewDocumentNode({
    children,
    placement: {
      ...placement,
      titleSingularTranslations: { 'en-US': 'Hero' }
    },
    preferredLanguageCode: 'en-US'
  })
  expect(children[0]?.label).toBe('Add new hero')
})

/**
 * ensureProjectHierarchyTreeAddNewNodePinnedToBottom
 * No-ops when add-new row is absent.
 */
test('Test that ensure pinned no-ops when add-new row is absent', () => {
  const children: I_faProjectHierarchyTreeHeTreeNode[] = [
    {
      children: [],
      childrenLoaded: false,
      documentId: 'doc-a',
      groupId: null,
      hasChildren: false,
      icon: 'mdi-file-outline',
      id: 'doc-a',
      label: 'Alpha',
      nodeKind: 'document',
      placementId: 'placement-1',
      worldColor: '#336699',
      worldId: 'world-1'
    }
  ]
  expect(ensureProjectHierarchyTreeAddNewNodePinnedToBottom(children)).toBe(false)
})

/**
 * ensureProjectHierarchyTreeAddNewNodePinnedToBottom
 * No-ops when add-new is already last child.
 */
test('Test that ensure pinned no-ops when add-new is already last child', () => {
  const placement = createPlacementSource()
  const children: I_faProjectHierarchyTreeHeTreeNode[] = []
  appendOrRefreshProjectHierarchyTreeAddNewDocumentNode({
    children,
    placement,
    preferredLanguageCode: 'en-US'
  })
  expect(ensureProjectHierarchyTreeAddNewNodePinnedToBottom(children)).toBe(false)
})

/**
 * isProjectHierarchyTreeAddNewDocumentNode
 * Matches id suffix rows and addNewDocument kind.
 */
test('Test that isProjectHierarchyTreeAddNewDocumentNode matches id suffix rows', () => {
  expect(isProjectHierarchyTreeAddNewDocumentNode({
    id: 'placement-9__add-new',
    nodeKind: 'document'
  })).toBe(true)
  expect(isProjectHierarchyTreeAddNewDocumentNode({
    id: 'placement-9',
    nodeKind: 'addNewDocument'
  })).toBe(true)
})

/**
 * finalizeProjectHierarchyTreePlacementTopLevelChildren
 * Falls back to placement id when placementId is null.
 */
test('Test that create add-new node falls back to placement id when placementId is null', () => {
  const placement = {
    ...createPlacementSource(),
    id: 'placement-9',
    placementId: null as unknown as string
  }
  const children = finalizeProjectHierarchyTreePlacementTopLevelChildren({
    children: [],
    placement,
    preferredLanguageCode: 'en-US'
  })
  expect(children[0]?.id).toBe('placement-9__add-new')
})

/**
 * refreshProjectHierarchyTreeAddNewDocumentLabelsInTree
 * Walks nested placements.
 */
test('Test that refreshProjectHierarchyTreeAddNewDocumentLabelsInTree walks nested placements', () => {
  const placement: I_faProjectHierarchyTreeHeTreeNode = {
    ...createPlacementSource(),
    children: [],
    childrenLoaded: true
  }
  appendOrRefreshProjectHierarchyTreeAddNewDocumentNode({
    children: placement.children,
    placement,
    preferredLanguageCode: 'en-US'
  })
  const tree: I_faProjectHierarchyTreeHeTreeNode[] = [
    {
      children: [placement],
      childrenLoaded: true,
      documentId: null,
      documentTemplateId: null,
      groupId: null,
      hasChildren: true,
      icon: 'mdi-earth',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      worldColor: '#336699',
      worldId: 'world-1'
    }
  ]
  refreshProjectHierarchyTreeAddNewDocumentLabelsInTree(tree, 'en-US')
  expect(placement.children[0]?.nodeKind).toBe('addNewDocument')
})
