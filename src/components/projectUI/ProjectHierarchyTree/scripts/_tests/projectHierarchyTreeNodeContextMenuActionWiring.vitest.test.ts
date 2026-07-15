/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeNodeContextMenuActionWiring } from '../projectHierarchyTreeNodeContextMenuActionWiring'

const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentId: null,
  groupId: null,
  hasChildren: true,
  icon: 'mdi-home',
  id: 'placement-1',
  label: 'Buildings',
  nodeKind: 'templatePlacement',
  placementId: 'placement-1',
  worldColor: '#ff0000',
  worldId: 'world-1'
}

test('Test that createProjectHierarchyTreeNodeContextMenuActionWiring dispatches add-new on placement anchors', () => {
  const onAddNewDocumentRowClick = vi.fn()
  const isNodeContextMenuOpen = ref(true)
  const wiring = createProjectHierarchyTreeNodeContextMenuActionWiring({
    bulkExpandCollapseWiring: {
      collapseAllUnderNode: vi.fn(async () => undefined),
      expandAllUnderNode: vi.fn(),
      isBulkExpandCollapseInFlight: () => false
    },
    contextMenuAnchorNodeId: ref('placement-1'),
    isNodeContextMenuOpen,
    onAddNewDocumentRowClick,
    treeData: ref([placementNode])
  })

  wiring.onAddNewDocumentFromContextMenuClick()

  expect(onAddNewDocumentRowClick).toHaveBeenCalledWith(placementNode)
  expect(isNodeContextMenuOpen.value).toBe(false)
})

test('Test that createProjectHierarchyTreeNodeContextMenuActionWiring no-ops without anchor', () => {
  const expandAllUnderNode = vi.fn()
  const wiring = createProjectHierarchyTreeNodeContextMenuActionWiring({
    bulkExpandCollapseWiring: {
      collapseAllUnderNode: vi.fn(async () => undefined),
      expandAllUnderNode,
      isBulkExpandCollapseInFlight: () => false
    },
    contextMenuAnchorNodeId: ref(null),
    isNodeContextMenuOpen: ref(true),
    onAddNewDocumentRowClick: vi.fn(),
    treeData: ref([placementNode])
  })

  wiring.onExpandAllUnderNodeClick()
  wiring.onCollapseAllUnderNodeClick()
  wiring.onAddNewDocumentFromContextMenuClick()

  expect(expandAllUnderNode).not.toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeNodeContextMenuActionWiring ignores document anchors for add-new', () => {
  const onAddNewDocumentRowClick = vi.fn()
  const documentNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-a',
    groupId: null,
    hasChildren: false,
    icon: 'mdi-home',
    id: 'doc-a',
    label: 'Hero',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
  const wiring = createProjectHierarchyTreeNodeContextMenuActionWiring({
    bulkExpandCollapseWiring: {
      collapseAllUnderNode: vi.fn(async () => undefined),
      expandAllUnderNode: vi.fn(),
      isBulkExpandCollapseInFlight: () => false
    },
    contextMenuAnchorNodeId: ref('doc-a'),
    isNodeContextMenuOpen: ref(true),
    onAddNewDocumentRowClick,
    treeData: ref([documentNode])
  })

  wiring.onAddNewDocumentFromContextMenuClick()

  expect(onAddNewDocumentRowClick).not.toHaveBeenCalled()
})
