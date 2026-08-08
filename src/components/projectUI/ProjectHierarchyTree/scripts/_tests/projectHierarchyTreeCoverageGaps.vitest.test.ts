/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref, watch } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { readProjectHierarchyTreeDragSiblingOrderFromDom } from '../projectHierarchyTreeDnDOrderDomWiring'
import {
  applyProjectHierarchyTreeDragCommitSiblingOrderPatch,
  applyProjectHierarchyTreeSiblingOrderToTreeData,
  resolveProjectHierarchyTreeDragSiblingOrderSnapshot
} from '../projectHierarchyTreeDnDOrderSupportWiring'
import { bindProjectHierarchyTreeSessionPendingRefreshFromEarlyWiring } from '../projectHierarchyTreePendingDocumentRefreshWiring'

function buildPlacementWithDocuments (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [buildDocumentNode('doc-a'), buildDocumentNode('doc-b')],
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
}

function buildDocumentNode (documentId: string): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId,
    groupId: null,
    hasChildren: false,
    icon: 'mdi-home',
    id: documentId,
    label: documentId,
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom returns null when bucket has no document siblings', () => {
  const addNewOnly: I_faProjectHierarchyTreeHeTreeNode = {
    children: [{
      children: [],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon: 'mdi-plus',
      id: 'placement-1__add-new',
      label: 'Add new',
      nodeKind: 'addNewDocument',
      placementId: 'placement-1',
      worldColor: '#ff0000',
      worldId: 'world-1'
    }],
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
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => document.createElement('div'),
    movedDocumentId: 'doc-a',
    treeData: [addNewOnly]
  })).toBeNull()
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom reads sibling order from DOM rows', () => {
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [{
    ...buildPlacementWithDocuments(),
    children: [
      buildDocumentNode('doc-b'),
      buildDocumentNode('doc-a'),
      buildDocumentNode('doc-c')
    ]
  }]
  const host = document.createElement('div')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const parentTreeNode = document.createElement('div')
  parentTreeNode.className = 'tree-node'
  const appendDocumentRow = (documentId: string): void => {
    const treeNode = document.createElement('div')
    treeNode.className = 'tree-node'
    const row = document.createElement('div')
    row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
    const nodeRoot = document.createElement('div')
    nodeRoot.setAttribute('data-test-hierarchy-node-id', documentId)
    row.appendChild(nodeRoot)
    treeNode.appendChild(row)
    parentTreeNode.appendChild(treeNode)
  }
  appendDocumentRow('doc-b')
  appendDocumentRow('doc-a')
  appendDocumentRow('doc-c')
  treeRoot.appendChild(parentTreeNode)
  host.appendChild(treeRoot)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => host,
    movedDocumentId: 'doc-a',
    treeData
  })).toEqual(['doc-b', 'doc-a', 'doc-c'])
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom returns null without scroll host', () => {
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => null,
    movedDocumentId: 'doc-a',
    treeData: [buildPlacementWithDocuments()]
  })).toBeNull()
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom returns null when moved row is absent from DOM', () => {
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [buildPlacementWithDocuments()]
  const host = document.createElement('div')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const parentTreeNode = document.createElement('div')
  parentTreeNode.className = 'tree-node'
  const treeNode = document.createElement('div')
  treeNode.className = 'tree-node'
  const row = document.createElement('div')
  row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
  const nodeRoot = document.createElement('div')
  nodeRoot.setAttribute('data-test-hierarchy-node-id', 'doc-b')
  row.appendChild(nodeRoot)
  treeNode.appendChild(row)
  parentTreeNode.appendChild(treeNode)
  treeRoot.appendChild(parentTreeNode)
  host.appendChild(treeRoot)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => host,
    movedDocumentId: 'doc-a',
    treeData
  })).toBeNull()
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom skips DOM rows without hierarchy node ids', () => {
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [{
    ...buildPlacementWithDocuments(),
    children: [
      buildDocumentNode('doc-b'),
      buildDocumentNode('doc-a'),
      buildDocumentNode('doc-c')
    ]
  }]
  const host = document.createElement('div')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const parentTreeNode = document.createElement('div')
  parentTreeNode.className = 'tree-node'
  const appendDocumentRow = (documentId: string | null): void => {
    const treeNode = document.createElement('div')
    treeNode.className = 'tree-node'
    const row = document.createElement('div')
    row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
    if (documentId !== null) {
      const nodeRoot = document.createElement('div')
      nodeRoot.setAttribute('data-test-hierarchy-node-id', documentId)
      row.appendChild(nodeRoot)
    }
    treeNode.appendChild(row)
    parentTreeNode.appendChild(treeNode)
  }
  appendDocumentRow('doc-b')
  appendDocumentRow(null)
  appendDocumentRow('doc-c')
  treeRoot.appendChild(parentTreeNode)
  host.appendChild(treeRoot)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => host,
    movedDocumentId: 'doc-b',
    treeData
  })).toEqual(['doc-b', 'doc-c'])
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom maps tree node ids to document ids', () => {
  const movedRow = {
    ...buildDocumentNode('doc-a'),
    id: 'node-a'
  }
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [{
    children: [movedRow, buildDocumentNode('doc-b')],
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
  }]
  const host = document.createElement('div')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const parentTreeNode = document.createElement('div')
  parentTreeNode.className = 'tree-node'
  const treeNode = document.createElement('div')
  treeNode.className = 'tree-node'
  const row = document.createElement('div')
  row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
  const nodeRoot = document.createElement('div')
  nodeRoot.setAttribute('data-test-hierarchy-node-id', 'node-a')
  row.appendChild(nodeRoot)
  treeNode.appendChild(row)
  parentTreeNode.appendChild(treeNode)
  treeRoot.appendChild(parentTreeNode)
  host.appendChild(treeRoot)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => host,
    movedDocumentId: 'doc-a',
    preferredNodeId: 'node-a',
    treeData
  })).toEqual(['doc-a'])
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom returns null when bucket rows lack document ids', () => {
  const brokenRow: I_faProjectHierarchyTreeHeTreeNode = {
    ...buildDocumentNode('doc-a'),
    documentId: null,
    id: 'node-a'
  }
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [{
    children: [brokenRow],
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
  }]
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => document.createElement('div'),
    movedDocumentId: 'node-a',
    treeData
  })).toBeNull()
})

test('Test that applyProjectHierarchyTreeSiblingOrderToTreeData returns false when bucket has no reorderable sibling rows', () => {
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [{
    children: [{
      children: [],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon: 'mdi-plus',
      id: 'placement-1__add-new',
      label: 'Add new',
      nodeKind: 'addNewDocument',
      placementId: 'placement-1',
      worldColor: '#ff0000',
      worldId: 'world-1'
    }],
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
  }]
  expect(applyProjectHierarchyTreeSiblingOrderToTreeData(treeData, 'doc-a', ['doc-a'])).toBe(false)
})

test('Test that applyProjectHierarchyTreeDragCommitSiblingOrderPatch no-ops when drag was not committed', () => {
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [{
    children: [buildDocumentNode('doc-a'), buildDocumentNode('doc-b')],
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
  }]
  applyProjectHierarchyTreeDragCommitSiblingOrderPatch({
    committed: false,
    draggedDocumentId: 'doc-a',
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-b', 'doc-a'],
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    treeData
  })
  expect(treeData[0]?.children.map((child) => child.documentId)).toEqual(['doc-a', 'doc-b'])
})

test('Test that applyProjectHierarchyTreeSiblingOrderToTreeData returns false when duplicate sibling ids collapse reorder rows', () => {
  const duplicateRow = buildDocumentNode('doc-a')
  const secondRow = {
    ...buildDocumentNode('doc-a'),
    id: 'doc-a-shadow'
  }
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [{
    children: [duplicateRow, secondRow],
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
  }]
  expect(applyProjectHierarchyTreeSiblingOrderToTreeData(treeData, 'doc-a', ['doc-a'])).toBe(false)
})

/**
 * resolveProjectHierarchyTreeDragSiblingOrderSnapshot
 * Under-tag parents return tagId snapshots instead of placement ids.
 */
test('Test that resolveProjectHierarchyTreeDragSiblingOrderSnapshot snapshots under-tag siblings', () => {
  const underTagDocA: I_faProjectHierarchyTreeHeTreeNode = {
    ...buildDocumentNode('doc-a'),
    id: 'tag-1__doc__doc-a',
    placementId: null,
    tagId: 'tag-1'
  }
  const underTagDocB: I_faProjectHierarchyTreeHeTreeNode = {
    ...buildDocumentNode('doc-b'),
    id: 'tag-1__doc__doc-b',
    placementId: null,
    tagId: 'tag-1'
  }
  const tagNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [underTagDocB, underTagDocA],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: 'mdi-tag',
    id: 'tag-1',
    label: 'Heroes',
    nodeKind: 'tag',
    placementId: null,
    tagId: 'tag-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
  expect(resolveProjectHierarchyTreeDragSiblingOrderSnapshot(
    [tagNode],
    'doc-a',
    'tag-1__doc__doc-a'
  )).toEqual({
    orderedDocumentIds: ['doc-b', 'doc-a'],
    parentDocumentId: null,
    placementId: '',
    tagId: 'tag-1',
    treeNodeId: 'tag-1__doc__doc-a'
  })
})

test('Test that applyProjectHierarchyTreeDragCommitSiblingOrderPatch no-ops without drag snapshot', () => {
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [buildPlacementWithDocuments()]
  applyProjectHierarchyTreeDragCommitSiblingOrderPatch({
    committed: true,
    draggedDocumentId: 'doc-a',
    dragSiblingOrderSnapshot: null,
    treeData
  })
  expect(treeData[0]?.children.map((child) => child.documentId)).toEqual(['doc-a', 'doc-b'])
})

/**
 * readProjectHierarchyTreeDragSiblingOrderFromDom
 * Skips non-preferred DOM matches, non-document tree nodes, and foreign sibling ids.
 */
test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom skips non-preferred and foreign DOM rows', () => {
  const preferredRow = {
    ...buildDocumentNode('doc-a'),
    id: 'tag-1__doc__doc-a'
  }
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [{
    children: [preferredRow, buildDocumentNode('doc-b')],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: 'mdi-tag',
    id: 'tag-1',
    label: 'Heroes',
    nodeKind: 'tag',
    placementId: null,
    tagId: 'tag-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }]
  const host = document.createElement('div')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const parentTreeNode = document.createElement('div')
  parentTreeNode.className = 'tree-node'

  const appendTreeChild = (options: {
    documentIdAttr: string | null
    includeDocumentRow: boolean
    isTreeNode: boolean
  }): void => {
    if (!options.isTreeNode) {
      parentTreeNode.appendChild(document.createElement('span'))
      return
    }
    const treeNode = document.createElement('div')
    treeNode.className = 'tree-node'
    if (options.includeDocumentRow) {
      const row = document.createElement('div')
      row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
      if (options.documentIdAttr !== null) {
        const nodeRoot = document.createElement('div')
        nodeRoot.setAttribute('data-test-hierarchy-node-id', options.documentIdAttr)
        row.appendChild(nodeRoot)
      }
      treeNode.appendChild(row)
    }
    parentTreeNode.appendChild(treeNode)
  }

  appendTreeChild({
    documentIdAttr: 'doc-a',
    includeDocumentRow: true,
    isTreeNode: true
  })
  appendTreeChild({
    documentIdAttr: null,
    includeDocumentRow: false,
    isTreeNode: true
  })
  appendTreeChild({
    documentIdAttr: 'foreign-doc',
    includeDocumentRow: true,
    isTreeNode: true
  })
  appendTreeChild({
    documentIdAttr: null,
    includeDocumentRow: true,
    isTreeNode: false
  })
  appendTreeChild({
    documentIdAttr: 'tag-1__doc__doc-a',
    includeDocumentRow: true,
    isTreeNode: true
  })
  appendTreeChild({
    documentIdAttr: 'doc-b',
    includeDocumentRow: true,
    isTreeNode: true
  })
  treeRoot.appendChild(parentTreeNode)
  host.appendChild(treeRoot)

  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => host,
    movedDocumentId: 'doc-a',
    preferredNodeId: preferredRow.id,
    treeData
  })).toEqual(['doc-a', 'doc-a', 'doc-b'])
})

test('Test that bindProjectHierarchyTreeSessionPendingRefreshFromEarlyWiring opens refreshed nodes', async () => {
  const parentNode = buildDocumentNode('doc-parent')
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([parentNode])
  const pendingDocumentRefreshIds = ref<string[]>([])
  const pendingHierarchyNodeRefreshIds = ref<string[]>([])
  const openNodeAndParents = vi.fn()
  const markNodeOpen = vi.fn()
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  bindProjectHierarchyTreeSessionPendingRefreshFromEarlyWiring({
    earlyWiring: {
      bootstrap: {
        sessionRefs: {
          treeComponentRef: ref({
            closeAll: vi.fn(),
            openNodeAndParents
          }),
          treeScrollHostRef: ref(null)
        }
      },
      subWiring: {
        lazyLoadWiring: {
          refreshNodeChildrenFromDatabase
        },
        uiStateWiring: {
          markNodeOpen
        }
      }
    } as never,
    hierarchyStore: {
      clearPendingDocumentRefreshIds: vi.fn(),
      clearPendingHierarchyNodeRefreshIds: vi.fn()
    },
    nextTick: async () => undefined,
    pendingDocumentRefreshIds,
    pendingHierarchyNodeRefreshIds,
    treeData,
    watch
  })
  pendingHierarchyNodeRefreshIds.value = ['doc-parent']
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  expect(refreshNodeChildrenFromDatabase).toHaveBeenCalledWith('doc-parent')
  expect(markNodeOpen).toHaveBeenCalledWith('doc-parent')
  expect(openNodeAndParents).toHaveBeenCalledWith(parentNode)
})
