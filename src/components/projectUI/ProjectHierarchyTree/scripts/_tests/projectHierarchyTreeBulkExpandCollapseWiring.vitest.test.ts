/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref, type Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeBulkExpandCollapseWiring } from '../projectHierarchyTreeBulkExpandCollapseWiring'

function createWorldNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
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
}

function createPassthroughDeferredLazyLoadBatchMock (
  reapplyHeTreeOpenState: () => void
) {
  return async (runBatch: () => Promise<void>) => {
    await runBatch()
    reapplyHeTreeOpenState()
  }
}

function createBulkExpandWiringDeps (overrides: {
  dragExpandUiFrozen?: Ref<boolean>
  getTreeRef?: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  nextTick?: () => Promise<void>
  openNodeIds?: Ref<Set<string>>
  queuePersistExpandedNodeIds?: (expandedNodeIds: string[]) => void
  reapplyHeTreeOpenState?: () => void
  reapplyLatentDescendantExpandState?: (options?: {
    deferHeTreeOpen?: boolean
  }) => Promise<void>
  runDeferredLazyLoadBatch?: (runBatch: () => Promise<void>) => Promise<void>
  suppressTreeEmit?: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  const reapplyHeTreeOpenState = overrides.reapplyHeTreeOpenState ?? vi.fn()
  const reapplyLatentDescendantExpandState =
    overrides.reapplyLatentDescendantExpandState ?? vi.fn(async () => {})
  const runDeferredLazyLoadBatch =
    overrides.runDeferredLazyLoadBatch ??
    createPassthroughDeferredLazyLoadBatchMock(reapplyHeTreeOpenState)
  return {
    dragExpandUiFrozen: overrides.dragExpandUiFrozen ?? ref(false),
    getTreeRef: overrides.getTreeRef ?? (() => null),
    nextTick: overrides.nextTick ?? (async () => {}),
    openNodeIds: overrides.openNodeIds ?? ref<Set<string>>(new Set()),
    queuePersistExpandedNodeIds: overrides.queuePersistExpandedNodeIds ?? vi.fn(),
    reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState,
    runDeferredLazyLoadBatch,
    suppressTreeEmit: overrides.suppressTreeEmit ?? ref(false),
    treeData: overrides.treeData
  }
}

test('expandAllUnderNode merges target ids and runs latent reapply in background', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([createWorldNode()])
  const openNodeIds = ref<Set<string>>(new Set())
  const suppressTreeEmit = ref(false)
  const reapplyLatentDescendantExpandState = vi.fn(async () => {})
  const reapplyHeTreeOpenState = vi.fn()
  const queuePersistExpandedNodeIds = vi.fn()

  const wiring = createProjectHierarchyTreeBulkExpandCollapseWiring(
    createBulkExpandWiringDeps({
      openNodeIds,
      queuePersistExpandedNodeIds,
      reapplyHeTreeOpenState,
      reapplyLatentDescendantExpandState,
      suppressTreeEmit,
      treeData
    })
  )

  wiring.expandAllUnderNode('world-1')
  expect(openNodeIds.value.has('world-1')).toBe(true)
  expect(openNodeIds.value.has('group-1')).toBe(true)
  expect(queuePersistExpandedNodeIds).toHaveBeenCalled()
  await vi.waitFor(() => {
    expect(reapplyLatentDescendantExpandState).toHaveBeenCalledWith({ deferHeTreeOpen: true })
    expect(reapplyHeTreeOpenState).toHaveBeenCalled()
  })
  expect(wiring.isBulkExpandCollapseInFlight()).toBe(false)
})

test('expandAllUnderNode no-ops while drag-expand frozen', () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([createWorldNode()])
  const openNodeIds = ref<Set<string>>(new Set())
  const dragExpandUiFrozen = ref(true)

  const wiring = createProjectHierarchyTreeBulkExpandCollapseWiring(
    createBulkExpandWiringDeps({
      dragExpandUiFrozen,
      openNodeIds,
      treeData
    })
  )

  wiring.expandAllUnderNode('world-1')
  expect(openNodeIds.value.size).toBe(0)
})

test('collapseAllUnderNode prunes open ids and reapplies remaining rows without remount', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([createWorldNode()])
  const openNodeIds = ref<Set<string>>(new Set(['world-1', 'group-1', 'doc-latent']))
  const suppressTreeEmit = ref(false)
  const closeAll = vi.fn()
  const reapplyHeTreeOpenState = vi.fn()
  const queuePersistExpandedNodeIds = vi.fn()

  const wiring = createProjectHierarchyTreeBulkExpandCollapseWiring(
    createBulkExpandWiringDeps({
      getTreeRef: () => ({
        $refs: {},
        closeAll,
        getData: () => [],
        openNodeAndParents: vi.fn()
      }),
      openNodeIds,
      queuePersistExpandedNodeIds,
      reapplyHeTreeOpenState,
      suppressTreeEmit,
      treeData
    })
  )

  await wiring.collapseAllUnderNode('group-1')
  expect(openNodeIds.value.has('group-1')).toBe(false)
  expect(openNodeIds.value.has('doc-latent')).toBe(false)
  expect(openNodeIds.value.has('world-1')).toBe(true)
  expect(suppressTreeEmit.value).toBe(false)
  expect(closeAll).toHaveBeenCalled()
  expect(reapplyHeTreeOpenState).toHaveBeenCalled()
  expect(queuePersistExpandedNodeIds).toHaveBeenCalled()
})

function createPlacementSubtree (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [
      {
        children: [
          {
            children: [
              {
                children: [],
                childrenLoaded: true,
                documentId: 'doc-child',
                groupId: 'group-1',
                hasChildren: false,
                icon: '',
                id: 'doc-child',
                label: 'Child',
                nodeKind: 'document',
                placementId: 'placement-1',
                worldColor: '#000',
                worldId: 'world-1'
              }
            ],
            childrenLoaded: true,
            documentId: 'doc-parent',
            groupId: 'group-1',
            hasChildren: true,
            icon: '',
            id: 'doc-parent',
            label: 'Parent',
            nodeKind: 'document',
            placementId: 'placement-1',
            worldColor: '#000',
            worldId: 'world-1'
          }
        ],
        childrenLoaded: true,
        documentId: null,
        groupId: 'group-1',
        hasChildren: true,
        icon: '',
        id: 'placement-1',
        label: 'Placement',
        nodeKind: 'templatePlacement',
        placementId: 'placement-1',
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
}

test('collapseAllUnderNode no-ops while drag-expand frozen', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([createWorldNode()])
  const openNodeIds = ref<Set<string>>(new Set(['world-1', 'group-1']))

  const wiring = createProjectHierarchyTreeBulkExpandCollapseWiring(
    createBulkExpandWiringDeps({
      dragExpandUiFrozen: ref(true),
      openNodeIds,
      treeData
    })
  )

  await wiring.collapseAllUnderNode('group-1')
  expect(openNodeIds.value.has('group-1')).toBe(true)
})

test('collapseAllUnderNode preempts in-flight expand instead of no-op', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([createPlacementSubtree()])
  const openNodeIds = ref<Set<string>>(new Set(['world-1', 'placement-1', 'doc-parent']))
  let resolveLatent: (() => void) | undefined
  const reapplyLatentDescendantExpandState = vi.fn(() => {
    return new Promise<void>((resolve) => {
      resolveLatent = resolve
    })
  })
  const reapplyHeTreeOpenState = vi.fn()

  const wiring = createProjectHierarchyTreeBulkExpandCollapseWiring(
    createBulkExpandWiringDeps({
      openNodeIds,
      reapplyHeTreeOpenState,
      reapplyLatentDescendantExpandState,
      runDeferredLazyLoadBatch: async (runBatch) => {
        await Promise.resolve()
        await runBatch()
        reapplyHeTreeOpenState()
      },
      treeData
    })
  )

  wiring.expandAllUnderNode('placement-1')
  expect(wiring.isBulkExpandCollapseInFlight()).toBe(true)
  await wiring.collapseAllUnderNode('placement-1')
  expect(openNodeIds.value.has('doc-parent')).toBe(false)
  expect(reapplyHeTreeOpenState).toHaveBeenCalled()
  resolveLatent?.()
  await Promise.resolve()
  await Promise.resolve()
  expect(openNodeIds.value.has('doc-parent')).toBe(false)
})

test('collapseAllUnderNode no-ops eviction when anchor id is missing', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([createWorldNode()])
  const openNodeIds = ref<Set<string>>(new Set(['world-1']))
  const reapplyHeTreeOpenState = vi.fn()

  const wiring = createProjectHierarchyTreeBulkExpandCollapseWiring(
    createBulkExpandWiringDeps({
      openNodeIds,
      reapplyHeTreeOpenState,
      treeData
    })
  )

  await wiring.collapseAllUnderNode('missing-anchor')
  expect(reapplyHeTreeOpenState).toHaveBeenCalled()
  expect(openNodeIds.value.has('world-1')).toBe(true)
})

test('collapseAllUnderNode aborts expand deep passes after latent resume', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([createPlacementSubtree()])
  const openNodeIds = ref<Set<string>>(new Set(['world-1', 'placement-1']))
  let resolveLatent: (() => void) | undefined
  let latentCalls = 0
  const reapplyLatentDescendantExpandState = vi.fn(() => {
    latentCalls += 1
    return new Promise<void>((resolve) => {
      resolveLatent = resolve
    })
  })
  const reapplyHeTreeOpenState = vi.fn()

  const wiring = createProjectHierarchyTreeBulkExpandCollapseWiring(
    createBulkExpandWiringDeps({
      openNodeIds,
      reapplyHeTreeOpenState,
      reapplyLatentDescendantExpandState,
      treeData
    })
  )

  wiring.expandAllUnderNode('placement-1')
  await vi.waitFor(() => {
    expect(latentCalls).toBe(1)
  })
  await wiring.collapseAllUnderNode('placement-1')
  resolveLatent?.()
  await Promise.resolve()
  await Promise.resolve()
  expect(latentCalls).toBe(1)
  expect(openNodeIds.value.has('doc-parent')).toBe(false)
})

test('expandAllUnderNode ignores stacked calls while background work is in flight', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([createWorldNode()])
  const openNodeIds = ref<Set<string>>(new Set())
  let resolveLatent: (() => void) | undefined
  const reapplyLatentDescendantExpandState = vi.fn(() => {
    return new Promise<void>((resolve) => {
      resolveLatent = resolve
    })
  })
  const queuePersistExpandedNodeIds = vi.fn()

  const wiring = createProjectHierarchyTreeBulkExpandCollapseWiring(
    createBulkExpandWiringDeps({
      openNodeIds,
      queuePersistExpandedNodeIds,
      reapplyLatentDescendantExpandState,
      treeData
    })
  )

  wiring.expandAllUnderNode('world-1')
  wiring.expandAllUnderNode('world-1')
  expect(queuePersistExpandedNodeIds).toHaveBeenCalled()
  expect(openNodeIds.value.has('world-1')).toBe(true)
  resolveLatent?.()
  await vi.waitFor(() => {
    expect(wiring.isBulkExpandCollapseInFlight()).toBe(false)
  })
})

test('expandAllUnderNode merges deeper targets after lazy children load', async () => {
  const placement: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: 'group-1',
    hasChildren: false,
    icon: '',
    id: 'placement-1',
    label: 'Placement',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const group: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: false,
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
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([{
    children: [group],
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
  }])
  const openNodeIds = ref<Set<string>>(new Set())
  const reapplyLatentDescendantExpandState = vi.fn(async () => {
    if (group.children.length === 0) {
      group.children = [placement]
      group.childrenLoaded = true
    }
  })

  const wiring = createProjectHierarchyTreeBulkExpandCollapseWiring(
    createBulkExpandWiringDeps({
      openNodeIds,
      reapplyLatentDescendantExpandState,
      treeData
    })
  )

  wiring.expandAllUnderNode('world-1')
  await vi.waitFor(() => {
    expect(openNodeIds.value.has('placement-1')).toBe(true)
  })
  expect(reapplyLatentDescendantExpandState).toHaveBeenCalled()
})

test('collapseAllUnderNode evicts placement and document children in subtree', async () => {
  const placementTree = createPlacementSubtree()
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([placementTree])
  const openNodeIds = ref<Set<string>>(new Set(['world-1', 'placement-1', 'doc-parent', 'doc-child']))

  const wiring = createProjectHierarchyTreeBulkExpandCollapseWiring(
    createBulkExpandWiringDeps({
      openNodeIds,
      treeData
    })
  )

  await wiring.collapseAllUnderNode('placement-1')
  const placement = treeData.value[0]!.children[0]!
  expect(placement.childrenLoaded).toBe(false)
  expect(placement.children).toEqual([])
})
