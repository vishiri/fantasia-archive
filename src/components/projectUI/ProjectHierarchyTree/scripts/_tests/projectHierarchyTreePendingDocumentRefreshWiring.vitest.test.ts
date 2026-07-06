/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref, watch } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  flushPendingProjectHierarchyTreeDocumentRefresh,
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

test('Test that wireProjectHierarchyTreePendingDocumentRefresh drains queued ids', async () => {
  const treeData = ref([buildPlacementNode()])
  const pendingDocumentRefreshIds = ref<string[]>([])
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  wireProjectHierarchyTreePendingDocumentRefresh({
    clearPendingDocumentRefreshIds: () => {
      pendingDocumentRefreshIds.value = []
    },
    pendingDocumentRefreshIds,
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
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  wireProjectHierarchyTreePendingDocumentRefresh({
    clearPendingDocumentRefreshIds: () => {
      pendingDocumentRefreshIds.value = []
    },
    pendingDocumentRefreshIds,
    refreshNodeChildrenFromDatabase,
    treeData,
    watch
  })
  pendingDocumentRefreshIds.value = []
  await Promise.resolve()
  expect(refreshNodeChildrenFromDatabase).not.toHaveBeenCalled()
})
