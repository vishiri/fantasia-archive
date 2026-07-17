/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { runProjectHierarchyTreeSessionExpandOpen } from '../projectHierarchyTreeSessionExpandOpenWiring'

function buildGroupNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
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
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

function buildAddNewNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: 'group-1',
    hasChildren: false,
    icon: '',
    id: 'add-new-placement-1',
    label: 'Add new',
    nodeKind: 'addNewDocument',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

test('Test that runProjectHierarchyTreeSessionExpandOpen flushes deferred publish before latent reapply on group open', async () => {
  const order: string[] = []
  await runProjectHierarchyTreeSessionExpandOpen({
    flushDeferredTreeRevisionPublish: async () => {
      order.push('flush')
    },
    loadChildrenForNode: async () => {
      order.push('load')
    },
    markNodeOpen: () => {
      order.push('mark')
    },
    node: buildGroupNode(),
    reapplyLatentDescendantExpandState: async () => {
      order.push('reapply')
    },
    treeRef: null
  })
  expect(order).toEqual(['mark', 'load', 'flush', 'reapply', 'flush'])
})

test('Test that runProjectHierarchyTreeSessionExpandOpen opens he-tree rows when tree ref exists', async () => {
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  await runProjectHierarchyTreeSessionExpandOpen({
    loadChildrenForNode: async () => undefined,
    markNodeOpen: vi.fn(),
    node: buildGroupNode(),
    reapplyLatentDescendantExpandState: async () => undefined,
    treeRef
  })
  expect(treeRef.openNodeAndParents).toHaveBeenCalledTimes(1)
})

test('Test that runProjectHierarchyTreeSessionExpandOpen skips latent reapply for add-new rows', async () => {
  const reapplyLatentDescendantExpandState = vi.fn(async () => undefined)
  await runProjectHierarchyTreeSessionExpandOpen({
    loadChildrenForNode: async () => undefined,
    markNodeOpen: vi.fn(),
    node: buildAddNewNode(),
    reapplyLatentDescendantExpandState,
    treeRef: null
  })
  expect(reapplyLatentDescendantExpandState).not.toHaveBeenCalled()
})

test('Test that runProjectHierarchyTreeSessionExpandOpen uses deferred batch then expand resync', async () => {
  const order: string[] = []
  const resyncHeTreeAfterExpandPublish = vi.fn(async (nodeId: string) => {
    order.push(`resync:${nodeId}`)
  })
  const runDeferredLazyLoadBatch = vi.fn(async (
    runBatch: () => Promise<void>,
    options?: { skipReapplyHeTreeOpenState?: boolean }
  ) => {
    order.push(`batch-start:${options?.skipReapplyHeTreeOpenState === true ? 'skip' : 'reapply'}`)
    await runBatch()
    order.push('batch-end')
  })
  await runProjectHierarchyTreeSessionExpandOpen({
    flushDeferredTreeRevisionPublish: async () => {
      order.push('flush-before-latent')
    },
    loadChildrenForNode: async () => {
      order.push('load')
    },
    markNodeOpen: () => {
      order.push('mark')
    },
    node: buildGroupNode(),
    reapplyLatentDescendantExpandState: async () => {
      order.push('reapply-latent')
    },
    resyncHeTreeAfterExpandPublish,
    runDeferredLazyLoadBatch,
    treeRef: {
      closeAll: vi.fn(),
      openNodeAndParents: vi.fn()
    }
  })
  expect(order).toEqual([
    'mark',
    'batch-start:skip',
    'load',
    'flush-before-latent',
    'reapply-latent',
    'flush-before-latent',
    'batch-end',
    'flush-before-latent',
    'reapply-latent',
    'flush-before-latent',
    'resync:group-1'
  ])
  expect(resyncHeTreeAfterExpandPublish).toHaveBeenCalledTimes(1)
})

test('Test that runProjectHierarchyTreeSessionExpandOpen resolves fresh tree node for nested deferred batch load', async () => {
  const staleNestedNode = {
    children: [],
    childrenLoaded: false,
    documentId: 'doc-nested',
    groupId: null,
    hasChildren: true,
    icon: 'mdi-file',
    id: 'doc-nested',
    label: 'Nested doc',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
  const freshNestedNode = {
    ...staleNestedNode,
    children: [
      {
        children: [],
        childrenLoaded: true,
        documentId: 'doc-child',
        groupId: null,
        hasChildren: false,
        icon: 'mdi-file',
        id: 'doc-child',
        label: 'Child doc',
        nodeKind: 'document' as const,
        placementId: 'placement-1',
        worldColor: '#ff0000',
        worldId: 'world-1'
      }
    ],
    childrenLoaded: true
  }
  const loadChildrenForNode = vi.fn(async () => undefined)
  const resyncHeTreeAfterExpandPublish = vi.fn(async () => undefined)
  await runProjectHierarchyTreeSessionExpandOpen({
    loadChildrenForNode,
    markNodeOpen: vi.fn(),
    node: staleNestedNode,
    reapplyLatentDescendantExpandState: async () => undefined,
    resyncHeTreeAfterExpandPublish,
    resolveTreeNodeById: () => freshNestedNode,
    runDeferredLazyLoadBatch: async (runBatch) => {
      await runBatch()
    },
    treeRef: {
      closeAll: vi.fn(),
      openNodeAndParents: vi.fn()
    }
  })
  expect(loadChildrenForNode).toHaveBeenCalledWith(freshNestedNode)
  expect(resyncHeTreeAfterExpandPublish).toHaveBeenCalledWith('doc-nested')
})

test('Test that runProjectHierarchyTreeSessionExpandOpen resolves fresh tree node for deferred batch load', async () => {
  const staleNode = buildGroupNode()
  const freshNode = {
    ...buildGroupNode(),
    label: 'Fresh group'
  }
  const loadChildrenForNode = vi.fn(async () => undefined)
  await runProjectHierarchyTreeSessionExpandOpen({
    loadChildrenForNode,
    markNodeOpen: vi.fn(),
    node: staleNode,
    reapplyLatentDescendantExpandState: async () => undefined,
    resolveTreeNodeById: () => freshNode,
    runDeferredLazyLoadBatch: async (runBatch) => {
      await runBatch()
    },
    treeRef: {
      closeAll: vi.fn(),
      openNodeAndParents: vi.fn()
    }
  })
  expect(loadChildrenForNode).toHaveBeenCalledWith(freshNode)
})

test('Test that runProjectHierarchyTreeSessionExpandOpen opens latent expanded siblings after deferred finish', async () => {
  const { ref } = await import('vue')
  const group = buildGroupNode()
  const sibling: I_faProjectHierarchyTreeHeTreeNode = {
    ...buildGroupNode(),
    id: 'group-2',
    groupId: 'group-2',
    label: 'Group 2'
  }
  const missingLatentId = 'missing-latent'
  const treeData = ref([group, sibling])
  const openNodeIds = ref(new Set(['group-1', 'group-2', missingLatentId]))
  const openNodeAndParents = vi.fn()
  await runProjectHierarchyTreeSessionExpandOpen({
    loadChildrenForNode: async () => undefined,
    markNodeOpen: vi.fn(),
    node: group,
    openNodeIds,
    reapplyLatentDescendantExpandState: async () => undefined,
    runDeferredLazyLoadBatch: async (runBatch) => {
      await runBatch()
    },
    treeData,
    treeRef: {
      closeAll: vi.fn(),
      openNodeAndParents
    }
  })
  expect(openNodeAndParents).toHaveBeenCalledWith(group)
  expect(openNodeAndParents).toHaveBeenCalledWith(sibling)
})
