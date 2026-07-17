import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  loadProjectHierarchyTreeNodeChildren,
  refreshProjectHierarchyTreeNodeChildrenFromDatabase
} from '../projectHierarchyTreeLazyLoadChildrenWiring'

function buildPlacementNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: false,
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

test('Test that loadProjectHierarchyTreeNodeChildren swallows placement not-found IPC errors', async () => {
  const node = buildPlacementNode()
  const treeData = ref([node])
  const listPlacementDocumentChildren = vi.fn(async () => {
    throw new Error('FaProjectContentNotFoundError: Document not found: doc-a')
  })
  await loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren,
    node,
    preferredLanguageCode: 'en-US',
    publishTreeRevision: vi.fn(async () => undefined),
    treeData
  })
  expect(listPlacementDocumentChildren).toHaveBeenCalledTimes(1)
})

test('Test that loadProjectHierarchyTreeNodeChildren swallows nested document not-found IPC errors', async () => {
  const node: I_faProjectHierarchyTreeHeTreeNode = {
    ...buildPlacementNode(),
    childrenLoaded: false,
    documentId: 'doc-parent',
    hasChildren: true,
    id: 'doc-parent',
    nodeKind: 'document'
  }
  const treeData = ref([node])
  const listPlacementDocumentChildren = vi.fn(async () => {
    throw new Error('FaProjectContentNotFoundError: Document not found: doc-parent')
  })
  await loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren,
    node,
    preferredLanguageCode: 'en-US',
    publishTreeRevision: vi.fn(async () => undefined),
    treeData
  })
  expect(listPlacementDocumentChildren).toHaveBeenCalledWith({
    parentDocumentId: 'doc-parent',
    placementId: 'placement-1'
  })
})

test('Test that loadProjectHierarchyTreeNodeChildren rethrows unexpected IPC errors', async () => {
  const node = buildPlacementNode()
  const treeData = ref([node])
  await expect(loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren: vi.fn(async () => {
      throw new Error('network down')
    }),
    node,
    preferredLanguageCode: 'en-US',
    publishTreeRevision: vi.fn(async () => undefined),
    treeData
  })).rejects.toThrow('network down')
})

test('Test that loadProjectHierarchyTreeNodeChildren stages placement children when stage callback is set', async () => {
  const node = buildPlacementNode()
  const treeData = ref([node])
  const stageLoadedChildrenForNode = vi.fn()
  const publishTreeRevision = vi.fn(async () => undefined)
  await loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren: vi.fn(async () => ({
      items: [{
        displayName: 'Doc A',
        hasChildren: false,
        id: 'doc-a',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      }]
    })),
    node,
    preferredLanguageCode: 'en-US',
    publishTreeRevision,
    stageLoadedChildrenForNode,
    treeData
  })
  expect(stageLoadedChildrenForNode).toHaveBeenCalledTimes(1)
  expect(publishTreeRevision).not.toHaveBeenCalled()
})

test('Test that loadProjectHierarchyTreeNodeChildren rethrows unexpected nested document IPC errors', async () => {
  const node: I_faProjectHierarchyTreeHeTreeNode = {
    ...buildPlacementNode(),
    childrenLoaded: false,
    documentId: 'doc-parent',
    hasChildren: true,
    id: 'doc-parent',
    nodeKind: 'document'
  }
  await expect(loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren: vi.fn(async () => {
      throw new Error('network down nested')
    }),
    node,
    preferredLanguageCode: 'en-US',
    publishTreeRevision: vi.fn(async () => undefined),
    treeData: ref([node])
  })).rejects.toThrow('network down nested')
})

test('Test that refreshProjectHierarchyTreeNodeChildrenFromDatabase no-ops for missing node id', async () => {
  const listPlacementDocumentChildren = vi.fn(async () => ({ items: [] }))
  await refreshProjectHierarchyTreeNodeChildrenFromDatabase({
    listPlacementDocumentChildren,
    nodeId: 'missing',
    preferredLanguageCode: 'en-US',
    publishTreeRevision: vi.fn(async () => undefined),
    treeData: ref([buildPlacementNode()])
  })
  expect(listPlacementDocumentChildren).not.toHaveBeenCalled()
})
