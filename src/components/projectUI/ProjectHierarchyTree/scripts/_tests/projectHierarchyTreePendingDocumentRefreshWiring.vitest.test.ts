/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref, watch } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  bindProjectHierarchyTreeSessionPendingRefresh,
  flushPendingProjectHierarchyTreeDocumentRefresh,
  flushPendingProjectHierarchyTreeNodeRefresh,
  wireProjectHierarchyTreePendingDocumentRefresh
} from '../projectHierarchyTreePendingDocumentRefreshWiring'

function buildPlacementNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [
      {
        children: [],
        childrenLoaded: true,
        documentId: 'doc-a',
        groupId: null,
        hasChildren: false,
        icon: 'mdi-home',
        id: 'doc-a',
        label: 'Doc A',
        nodeKind: 'document',
        placementId: 'placement-1',
        worldColor: '#ff0000',
        worldId: 'world-1'
      }
    ],
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

test('Test that flushPendingProjectHierarchyTreeDocumentRefresh reloads parent buckets', async () => {
  const treeData = ref([buildPlacementNode()])
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  await flushPendingProjectHierarchyTreeDocumentRefresh({
    documentIds: ['doc-a'],
    refreshNodeChildrenFromDatabase,
    treeData
  })
  expect(refreshNodeChildrenFromDatabase).toHaveBeenCalledWith('placement-1')
})

test('Test that flushPendingProjectHierarchyTreeDocumentRefresh reloads expanded saved document children', async () => {
  const treeData = ref([
    {
      ...buildPlacementNode(),
      children: [
        {
          children: [
            {
              children: [],
              childrenLoaded: true,
              documentId: 'doc-child',
              groupId: null,
              hasChildren: false,
              icon: 'mdi-home',
              id: 'doc-child',
              label: 'Doc Child',
              nodeKind: 'document' as const,
              placementId: 'placement-1',
              worldColor: '#ff0000',
              worldId: 'world-1'
            }
          ],
          childrenLoaded: true,
          documentId: 'doc-parent',
          groupId: null,
          hasChildren: true,
          icon: 'mdi-home',
          id: 'doc-parent',
          label: 'Doc Parent',
          nodeKind: 'document' as const,
          placementId: 'placement-1',
          worldColor: '#ff0000',
          worldId: 'world-1'
        }
      ]
    }
  ])
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  await flushPendingProjectHierarchyTreeDocumentRefresh({
    documentIds: ['doc-parent'],
    refreshNodeChildrenFromDatabase,
    treeData
  })
  expect(refreshNodeChildrenFromDatabase).toHaveBeenCalledTimes(2)
  expect(refreshNodeChildrenFromDatabase).toHaveBeenNthCalledWith(1, 'placement-1')
  expect(refreshNodeChildrenFromDatabase).toHaveBeenNthCalledWith(2, 'doc-parent')
})

test('Test that flushPendingProjectHierarchyTreeNodeRefresh reloads explicit node ids', async () => {
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  await flushPendingProjectHierarchyTreeNodeRefresh({
    nodeIds: ['doc-grandparent', 'placement-1'],
    refreshNodeChildrenFromDatabase
  })
  expect(refreshNodeChildrenFromDatabase).toHaveBeenCalledTimes(2)
  expect(refreshNodeChildrenFromDatabase).toHaveBeenNthCalledWith(1, 'doc-grandparent')
  expect(refreshNodeChildrenFromDatabase).toHaveBeenNthCalledWith(2, 'placement-1')
})

test('Test that flushPendingProjectHierarchyTreeNodeRefresh opens refreshed nodes in he-tree', async () => {
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  const openRefreshedNodeInTree = vi.fn(async () => undefined)
  await flushPendingProjectHierarchyTreeNodeRefresh({
    nodeIds: ['doc-parent', 'placement-1'],
    openRefreshedNodeInTree,
    refreshNodeChildrenFromDatabase
  })
  expect(openRefreshedNodeInTree).toHaveBeenCalledTimes(2)
  expect(openRefreshedNodeInTree).toHaveBeenNthCalledWith(1, 'doc-parent')
  expect(openRefreshedNodeInTree).toHaveBeenNthCalledWith(2, 'placement-1')
})

test('Test that wireProjectHierarchyTreePendingDocumentRefresh drains queued ids', async () => {
  const treeData = ref([buildPlacementNode()])
  const pendingDocumentRefreshIds = ref<string[]>([])
  const pendingHierarchyNodeRefreshIds = ref<string[]>([])
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  wireProjectHierarchyTreePendingDocumentRefresh({
    clearPendingDocumentRefreshIds: () => {
      pendingDocumentRefreshIds.value = []
    },
    clearPendingHierarchyNodeRefreshIds: () => {
      pendingHierarchyNodeRefreshIds.value = []
    },
    pendingDocumentRefreshIds,
    pendingHierarchyNodeRefreshIds,
    refreshNodeChildrenFromDatabase,
    treeData,
    watch
  })
  pendingDocumentRefreshIds.value = ['doc-a']
  await Promise.resolve()
  await Promise.resolve()
  expect(refreshNodeChildrenFromDatabase).toHaveBeenCalledWith('placement-1')
  expect(pendingDocumentRefreshIds.value).toEqual([])
})

test('Test that wireProjectHierarchyTreePendingDocumentRefresh drains queued hierarchy node ids', async () => {
  const treeData = ref([buildPlacementNode()])
  const pendingDocumentRefreshIds = ref<string[]>([])
  const pendingHierarchyNodeRefreshIds = ref<string[]>([])
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  wireProjectHierarchyTreePendingDocumentRefresh({
    clearPendingDocumentRefreshIds: () => {
      pendingDocumentRefreshIds.value = []
    },
    clearPendingHierarchyNodeRefreshIds: () => {
      pendingHierarchyNodeRefreshIds.value = []
    },
    pendingDocumentRefreshIds,
    pendingHierarchyNodeRefreshIds,
    refreshNodeChildrenFromDatabase,
    treeData,
    watch
  })
  pendingHierarchyNodeRefreshIds.value = ['doc-grandparent', 'placement-1']
  await Promise.resolve()
  await Promise.resolve()
  expect(refreshNodeChildrenFromDatabase).toHaveBeenCalledTimes(2)
  expect(pendingHierarchyNodeRefreshIds.value).toEqual([])
})

test('Test that flushPendingProjectHierarchyTreeDocumentRefresh skips when no ids are queued', async () => {
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  await flushPendingProjectHierarchyTreeDocumentRefresh({
    documentIds: [],
    refreshNodeChildrenFromDatabase,
    treeData: ref([buildPlacementNode()])
  })
  expect(refreshNodeChildrenFromDatabase).not.toHaveBeenCalled()
})

test('Test that wireProjectHierarchyTreePendingDocumentRefresh ignores empty queue updates', async () => {
  const treeData = ref([buildPlacementNode()])
  const pendingDocumentRefreshIds = ref<string[]>([])
  const pendingHierarchyNodeRefreshIds = ref<string[]>([])
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  wireProjectHierarchyTreePendingDocumentRefresh({
    clearPendingDocumentRefreshIds: () => {
      pendingDocumentRefreshIds.value = []
    },
    clearPendingHierarchyNodeRefreshIds: () => {
      pendingHierarchyNodeRefreshIds.value = []
    },
    pendingDocumentRefreshIds,
    pendingHierarchyNodeRefreshIds,
    refreshNodeChildrenFromDatabase,
    treeData,
    watch
  })
  pendingDocumentRefreshIds.value = []
  await Promise.resolve()
  expect(refreshNodeChildrenFromDatabase).not.toHaveBeenCalled()
})

test('Test that bindProjectHierarchyTreeSessionPendingRefresh wires hierarchy node queue drains', async () => {
  const treeData = ref([buildPlacementNode()])
  const pendingDocumentRefreshIds = ref<string[]>([])
  const pendingHierarchyNodeRefreshIds = ref<string[]>([])
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  const clearPendingHierarchyNodeRefreshIds = vi.fn(() => {
    pendingHierarchyNodeRefreshIds.value = []
  })
  bindProjectHierarchyTreeSessionPendingRefresh({
    hierarchyStore: {
      clearPendingDocumentRefreshIds: vi.fn(),
      clearPendingHierarchyNodeRefreshIds
    },
    pendingDocumentRefreshIds,
    pendingHierarchyNodeRefreshIds,
    refreshNodeChildrenFromDatabase,
    treeData,
    watch
  })
  pendingHierarchyNodeRefreshIds.value = ['placement-1']
  await Promise.resolve()
  await Promise.resolve()
  expect(clearPendingHierarchyNodeRefreshIds).toHaveBeenCalled()
  expect(refreshNodeChildrenFromDatabase).toHaveBeenCalledWith('placement-1')
})
