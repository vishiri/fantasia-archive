/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { openProjectHierarchyTreeNodeInHeTree } from '../projectHierarchyTreeNestParentOpenWiring'

const parentNode: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentId: 'doc-parent',
  groupId: null,
  hasChildren: true,
  icon: 'mdi-account',
  id: 'doc-parent',
  label: 'Parent',
  nodeKind: 'document',
  placementId: 'placement-1',
  worldColor: '#ff0000',
  worldId: 'world-1'
}

test('Test that openProjectHierarchyTreeNodeInHeTree marks node open and calls he-tree', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([parentNode])
  const markNodeOpen = vi.fn()
  const openNodeAndParents = vi.fn()
  await openProjectHierarchyTreeNodeInHeTree({
    getTreeRef: () => ({
      closeAll: vi.fn(),
      openNodeAndParents
    }),
    markNodeOpen,
    nextTick: async () => undefined,
    nodeId: 'doc-parent',
    treeData
  })
  expect(markNodeOpen).toHaveBeenCalledWith('doc-parent')
  expect(openNodeAndParents).toHaveBeenCalledWith(parentNode)
})

test('Test that openProjectHierarchyTreeNodeInHeTree no-ops for missing nodes and tree refs', async () => {
  const markNodeOpen = vi.fn()
  await openProjectHierarchyTreeNodeInHeTree({
    getTreeRef: () => null,
    markNodeOpen,
    nextTick: async () => undefined,
    nodeId: 'missing',
    treeData: ref([])
  })
  expect(markNodeOpen).not.toHaveBeenCalled()
})
