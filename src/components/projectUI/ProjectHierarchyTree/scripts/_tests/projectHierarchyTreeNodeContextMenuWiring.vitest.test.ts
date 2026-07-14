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

function createPlacementNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [{
      children: [],
      childrenLoaded: true,
      documentId: null,
      documentTemplateId: 'template-1',
      groupId: null,
      hasChildren: false,
      icon: 'mdi-plus',
      id: 'placement-1__add-new',
      label: 'Add new building',
      nodeKind: 'addNewDocument',
      placementId: 'placement-1',
      worldColor: '#000',
      worldId: 'world-1'
    }],
    childrenLoaded: true,
    documentId: null,
    documentTemplateId: 'template-1',
    groupId: 'group-1',
    hasChildren: true,
    icon: '',
    id: 'placement-1',
    label: 'Buildings',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    titlePluralTranslations: { 'en-US': 'Buildings' },
    titleSingularTranslations: { 'en-US': 'Building' },
    worldColor: '#000',
    worldId: 'world-1'
  }
}

function createContextMenuWiring (treeData = ref(sampleTree)) {
  const expandAllUnderNode = vi.fn()
  const collapseAllUnderNode = vi.fn(async () => {})
  const onAddNewDocumentRowClick = vi.fn()
  const wiring = createProjectHierarchyTreeNodeContextMenuWiring({
    bulkExpandCollapseWiring: {
      collapseAllUnderNode,
      expandAllUnderNode,
      isBulkExpandCollapseInFlight: () => false
    },
    onAddNewDocumentRowClick,
    resolvePreferredLanguageCode: () => 'en-US',
    treeData
  })

  return {
    collapseAllUnderNode,
    expandAllUnderNode,
    onAddNewDocumentRowClick,
    wiring
  }
}

test('onNodeRowContextMenu opens menu for eligible structural rows', () => {
  const { wiring } = createContextMenuWiring()

  const row = document.createElement('div')
  const event = new MouseEvent('contextmenu', { bubbles: true })
  Object.defineProperty(event, 'currentTarget', {
    value: row
  })
  const preventDefault = vi.spyOn(event, 'preventDefault')

  wiring.onNodeRowContextMenu(sampleTree[0]!, event)
  expect(preventDefault).toHaveBeenCalled()
  expect(wiring.isNodeContextMenuOpen.value).toBe(true)
  expect(wiring.nodeMenuPointerPosition.value).toEqual({
    left: event.clientX,
    top: event.clientY
  })
  expect(wiring.contextMenuAnchorNodeId.value).toBe('world-1')
  expect(wiring.contextMenuAddNewRowLabel.value).toBeNull()
})

test('onNodeRowContextMenu exposes add-new row for template placements', () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([{
    ...sampleTree[0]!,
    children: [{
      ...sampleTree[0]!.children[0]!,
      children: [createPlacementNode()]
    }]
  }])
  const { wiring } = createContextMenuWiring(treeData)
  const placement = createPlacementNode()
  const event = new MouseEvent('contextmenu', { bubbles: true })
  Object.defineProperty(event, 'currentTarget', {
    value: document.createElement('div')
  })

  wiring.onNodeRowContextMenu(placement, event)
  expect(wiring.contextMenuAddNewRowLabel.value).toBe('Add new building')
  expect(wiring.contextMenuAddNewRowIcon.value).toBe('mdi-plus')
})

test('onAddNewDocumentFromContextMenuClick delegates to add-new handler', () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([{
    ...sampleTree[0]!,
    children: [{
      ...sampleTree[0]!.children[0]!,
      children: [createPlacementNode()]
    }]
  }])
  const { onAddNewDocumentRowClick, wiring } = createContextMenuWiring(treeData)
  const placement = createPlacementNode()
  const event = new MouseEvent('contextmenu', { bubbles: true })
  Object.defineProperty(event, 'currentTarget', {
    value: document.createElement('div')
  })

  wiring.onNodeRowContextMenu(placement, event)
  wiring.onAddNewDocumentFromContextMenuClick()
  expect(onAddNewDocumentRowClick).toHaveBeenCalledWith(placement)
  expect(wiring.isNodeContextMenuOpen.value).toBe(false)
})

test('onNodeRowContextMenu suppresses menu for leaf document rows', () => {
  const { wiring } = createContextMenuWiring()
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
  const { collapseAllUnderNode, expandAllUnderNode, wiring } = createContextMenuWiring()

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
  const { wiring } = createContextMenuWiring()
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
  const { wiring } = createContextMenuWiring()
  const event = new MouseEvent('contextmenu', { bubbles: true })
  Object.defineProperty(event, 'currentTarget', {
    value: null
  })

  wiring.onNodeRowContextMenu(sampleTree[0]!, event)
  expect(wiring.isNodeContextMenuOpen.value).toBe(false)
})

test('menu clicks no-op when anchor id is cleared', () => {
  const { collapseAllUnderNode, expandAllUnderNode, onAddNewDocumentRowClick, wiring } = createContextMenuWiring()

  wiring.onExpandAllUnderNodeClick()
  wiring.onCollapseAllUnderNodeClick()
  wiring.onAddNewDocumentFromContextMenuClick()
  expect(expandAllUnderNode).not.toHaveBeenCalled()
  expect(collapseAllUnderNode).not.toHaveBeenCalled()
  expect(onAddNewDocumentRowClick).not.toHaveBeenCalled()
})

test('onNodeContextMenuHide clears anchor id and add-new row', () => {
  const { wiring } = createContextMenuWiring()

  wiring.contextMenuAnchorNodeId.value = 'world-1'
  wiring.contextMenuAddNewRowLabel.value = 'Add new building'
  wiring.contextMenuAddNewRowIcon.value = 'mdi-plus'
  wiring.onNodeContextMenuHide()
  expect(wiring.contextMenuAnchorNodeId.value).toBeNull()
  expect(wiring.nodeMenuPointerPosition.value).toBeNull()
  expect(wiring.contextMenuAddNewRowLabel.value).toBeNull()
  expect(wiring.contextMenuAddNewRowIcon.value).toBeNull()
})
