import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

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

function placementListChild (id: string, displayName: string): I_faProjectHierarchyTreeDocumentChild {
  return {
    displayName,
    hasChildren: false,
    id,
    parentDocumentId: null,
    placementId: 'placement-1',
    sortOrder: 0
  }
}

test('Test that a later child load drops an older placement list', async () => {
  const node = buildPlacementNode()
  const treeData = ref([node])
  let resolveFirst: ((value: {
    items: I_faProjectHierarchyTreeDocumentChild[]
  }) => void) | undefined
  let listCalls = 0
  const listPlacementDocumentChildren = vi.fn((): Promise<{
    items: I_faProjectHierarchyTreeDocumentChild[]
  }> => {
    listCalls += 1
    if (listCalls === 1) {
      return new Promise((resolve) => {
        resolveFirst = resolve
      })
    }
    return Promise.resolve({
      items: [placementListChild('doc-b', 'Doc B')]
    })
  })
  const firstLoad = loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren,
    node,
    preferredLanguageCode: 'en-US',
    publishTreeRevision: vi.fn(async () => undefined),
    treeData
  })
  const secondLoad = loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren,
    node,
    preferredLanguageCode: 'en-US',
    publishTreeRevision: vi.fn(async () => undefined),
    treeData
  })
  await Promise.resolve()
  resolveFirst?.({
    items: [placementListChild('doc-a', 'Doc A')]
  })
  await Promise.all([firstLoad, secondLoad])
  expect(node.children.map((child) => child.id)).toEqual([
    'doc-b',
    'placement-1__add-new'
  ])
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
