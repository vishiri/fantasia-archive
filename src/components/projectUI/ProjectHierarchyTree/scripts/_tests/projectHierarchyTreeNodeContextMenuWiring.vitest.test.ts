/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeNodeContextMenuWiring } from '../projectHierarchyTreeNodeContextMenuWiring'

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

test('onNodeRowContextMenu opens menu for eligible structural rows', () => {
  const treeData = ref(sampleTree)
  const expandAllUnderNode = vi.fn()
  const collapseAllUnderNode = vi.fn(async () => {})
  const wiring = createProjectHierarchyTreeNodeContextMenuWiring({
    bulkExpandCollapseWiring: {
      collapseAllUnderNode,
      expandAllUnderNode,
      isBulkExpandCollapseInFlight: () => false
    },
    treeData
  })

  const row = document.createElement('div')
  const event = new MouseEvent('contextmenu', { bubbles: true })
  Object.defineProperty(event, 'currentTarget', {
    value: row
  })
  const preventDefault = vi.spyOn(event, 'preventDefault')

  wiring.onNodeRowContextMenu(sampleTree[0]!, event)
  expect(preventDefault).toHaveBeenCalled()
  expect(wiring.isNodeContextMenuOpen.value).toBe(true)
  expect(wiring.nodeMenuTargetElement.value).toBe(row)
  expect(wiring.contextMenuAnchorNodeId.value).toBe('world-1')
})

test('onNodeRowContextMenu suppresses menu for leaf document rows', () => {
  const treeData = ref(sampleTree)
  const wiring = createProjectHierarchyTreeNodeContextMenuWiring({
    bulkExpandCollapseWiring: {
      collapseAllUnderNode: vi.fn(async () => {}),
      expandAllUnderNode: vi.fn(),
      isBulkExpandCollapseInFlight: () => false
    },
    treeData
  })
  const leafDocument: I_faProjectHierarchyTreeHeTreeNode = {
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
  const event = new MouseEvent('contextmenu', { bubbles: true })
  Object.defineProperty(event, 'currentTarget', {
    value: document.createElement('div')
  })
  vi.spyOn(event, 'preventDefault')

  wiring.onNodeRowContextMenu(leafDocument, event)
  expect(wiring.isNodeContextMenuOpen.value).toBe(false)
})

test('menu actions delegate to bulk wiring and close menu', async () => {
  const treeData = ref(sampleTree)
  const expandAllUnderNode = vi.fn()
  const collapseAllUnderNode = vi.fn(async () => {})
  const wiring = createProjectHierarchyTreeNodeContextMenuWiring({
    bulkExpandCollapseWiring: {
      collapseAllUnderNode,
      expandAllUnderNode,
      isBulkExpandCollapseInFlight: () => false
    },
    treeData
  })

  wiring.contextMenuAnchorNodeId.value = 'world-1'
  wiring.isNodeContextMenuOpen.value = true
  wiring.onExpandAllUnderNodeClick()
  expect(expandAllUnderNode).toHaveBeenCalledWith('world-1')
  expect(wiring.isNodeContextMenuOpen.value).toBe(false)

  wiring.contextMenuAnchorNodeId.value = 'world-1'
  wiring.isNodeContextMenuOpen.value = true
  wiring.onCollapseAllUnderNodeClick()
  expect(collapseAllUnderNode).toHaveBeenCalledWith('world-1')
  expect(wiring.isNodeContextMenuOpen.value).toBe(false)
})

test('onNodeRowContextMenu prevents default for add-new rows without opening menu', () => {
  const treeData = ref(sampleTree)
  const wiring = createProjectHierarchyTreeNodeContextMenuWiring({
    bulkExpandCollapseWiring: {
      collapseAllUnderNode: vi.fn(async () => {}),
      expandAllUnderNode: vi.fn(),
      isBulkExpandCollapseInFlight: () => false
    },
    treeData
  })
  const event = new MouseEvent('contextmenu', { bubbles: true })
  Object.defineProperty(event, 'currentTarget', {
    value: document.createElement('div')
  })
  const preventDefault = vi.spyOn(event, 'preventDefault')

  wiring.onNodeRowContextMenu({
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
  }, event)

  expect(preventDefault).toHaveBeenCalled()
  expect(wiring.isNodeContextMenuOpen.value).toBe(false)
})

test('onNodeRowContextMenu ignores events without HTMLElement currentTarget', () => {
  const treeData = ref(sampleTree)
  const wiring = createProjectHierarchyTreeNodeContextMenuWiring({
    bulkExpandCollapseWiring: {
      collapseAllUnderNode: vi.fn(async () => {}),
      expandAllUnderNode: vi.fn(),
      isBulkExpandCollapseInFlight: () => false
    },
    treeData
  })
  const event = new MouseEvent('contextmenu', { bubbles: true })
  Object.defineProperty(event, 'currentTarget', {
    value: null
  })

  wiring.onNodeRowContextMenu(sampleTree[0]!, event)
  expect(wiring.isNodeContextMenuOpen.value).toBe(false)
})

test('menu clicks no-op when anchor id is cleared', () => {
  const expandAllUnderNode = vi.fn()
  const collapseAllUnderNode = vi.fn(async () => {})
  const wiring = createProjectHierarchyTreeNodeContextMenuWiring({
    bulkExpandCollapseWiring: {
      collapseAllUnderNode,
      expandAllUnderNode,
      isBulkExpandCollapseInFlight: () => false
    },
    treeData: ref(sampleTree)
  })

  wiring.onExpandAllUnderNodeClick()
  wiring.onCollapseAllUnderNodeClick()
  expect(expandAllUnderNode).not.toHaveBeenCalled()
  expect(collapseAllUnderNode).not.toHaveBeenCalled()
})

test('onNodeContextMenuHide clears anchor id', () => {
  const wiring = createProjectHierarchyTreeNodeContextMenuWiring({
    bulkExpandCollapseWiring: {
      collapseAllUnderNode: vi.fn(async () => {}),
      expandAllUnderNode: vi.fn(),
      isBulkExpandCollapseInFlight: () => false
    },
    treeData: ref(sampleTree)
  })

  wiring.contextMenuAnchorNodeId.value = 'world-1'
  wiring.onNodeContextMenuHide()
  expect(wiring.contextMenuAnchorNodeId.value).toBeNull()
})
