/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { evictCollapsedNodeChildren } from '../../functions/projectHierarchyTreeExpandState'
import { markProjectHierarchyTreeNodeClosed } from '../projectHierarchyTreeNodeOpenCloseStateWiring'
import { reapplyProjectHierarchyTreeLatentDescendantExpandState } from '../projectHierarchyTreeLatentExpandReapplyWiring'
import { runProjectHierarchyTreeSessionExpandOpen } from '../projectHierarchyTreeSessionExpandOpenWiring'
import { createProjectHierarchyTreeLazyLoadWiring } from '../projectHierarchyTreeLazyLoadWiring'

function buildDocumentNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: false,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: true,
    icon: 'mdi-home',
    id: 'doc-parent',
    label: 'Parent doc',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

test('Test that deferred lazy load flush merges staged children in place', async () => {
  const deferLazyLoadTreeRevisionPublish = ref(false)
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([buildDocumentNode()])
  const nodeBeforeLoad = treeData.value[0]!
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: [
      {
        displayName: 'Child doc',
        hasChildren: false,
        id: 'doc-child',
        parentDocumentId: 'doc-parent',
        placementId: 'placement-1',
        sortOrder: 0
      }
    ]
  }))
  const onAfterTreeRevisionPublished = vi.fn()

  const wiring = createProjectHierarchyTreeLazyLoadWiring({
    deferLazyLoadTreeRevisionPublish,
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished,
    shouldDeferTreeRevisionPublish: () => deferLazyLoadTreeRevisionPublish.value,
    suppressTreeEmit: ref(false),
    treeData
  })

  deferLazyLoadTreeRevisionPublish.value = true
  await wiring.loadChildrenForNode(nodeBeforeLoad)
  await wiring.flushDeferredTreeRevisionPublish()

  const nodeAfterFirstLoad = treeData.value[0]!
  expect(nodeAfterFirstLoad).toBe(nodeBeforeLoad)
  expect(nodeAfterFirstLoad.children).toHaveLength(1)
  expect(nodeAfterFirstLoad.children[0]!.id).toBe('doc-child')

  evictCollapsedNodeChildren(nodeAfterFirstLoad)
  expect(nodeAfterFirstLoad.children).toHaveLength(0)
  expect(nodeAfterFirstLoad.childrenLoaded).toBe(false)

  deferLazyLoadTreeRevisionPublish.value = true
  await wiring.loadChildrenForNode(nodeAfterFirstLoad)
  await wiring.flushDeferredTreeRevisionPublish()

  const nodeAfterReopen = treeData.value[0]!
  expect(nodeAfterReopen).toBe(nodeAfterFirstLoad)
  expect(nodeAfterReopen.children).toHaveLength(1)
  expect(nodeAfterReopen.children[0]!.id).toBe('doc-child')
  expect(listPlacementDocumentChildren).toHaveBeenCalledTimes(2)
})

test('Test that expand open reloads evicted document children after close and reopen', async () => {
  const deferLazyLoadTreeRevisionPublish = ref(false)
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([buildDocumentNode()])
  const openNodeAndParents = vi.fn()
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents
  }
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: [
      {
        displayName: 'Child doc',
        hasChildren: false,
        id: 'doc-child',
        parentDocumentId: 'doc-parent',
        placementId: 'placement-1',
        sortOrder: 0
      }
    ]
  }))
  const lazyLoadWiring = createProjectHierarchyTreeLazyLoadWiring({
    deferLazyLoadTreeRevisionPublish,
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished: vi.fn(),
    shouldDeferTreeRevisionPublish: () => deferLazyLoadTreeRevisionPublish.value,
    suppressTreeEmit: ref(false),
    treeData
  })
  async function runDeferredLazyLoadBatch (runBatch: () => Promise<void>): Promise<void> {
    deferLazyLoadTreeRevisionPublish.value = true
    try {
      await runBatch()
      await lazyLoadWiring.flushDeferredTreeRevisionPublish()
    } finally {
      deferLazyLoadTreeRevisionPublish.value = false
    }
  }
  const firstNode = treeData.value[0]!
  await runProjectHierarchyTreeSessionExpandOpen({
    loadChildrenForNode: lazyLoadWiring.loadChildrenForNode,
    markNodeOpen: vi.fn(),
    node: firstNode,
    reapplyLatentDescendantExpandState: async () => undefined,
    resolveTreeNodeById: (nodeId) => treeData.value.find((row) => row.id === nodeId) ?? null,
    runDeferredLazyLoadBatch,
    treeRef
  })
  expect(treeData.value[0]!.children).toHaveLength(1)
  expect(openNodeAndParents).toHaveBeenCalledTimes(1)
  markProjectHierarchyTreeNodeClosed({
    node: treeData.value[0]!,
    nodeId: treeData.value[0]!.id,
    openNodeIds: ref(new Set([treeData.value[0]!.id])),
    queuePersistExpandedNodeIds: vi.fn(),
    treeData
  })
  const nodeAfterClose = treeData.value[0]!
  expect(nodeAfterClose.children).toHaveLength(0)
  await runProjectHierarchyTreeSessionExpandOpen({
    loadChildrenForNode: lazyLoadWiring.loadChildrenForNode,
    markNodeOpen: vi.fn(),
    node: nodeAfterClose,
    reapplyLatentDescendantExpandState: async () => undefined,
    resolveTreeNodeById: (nodeId) => treeData.value.find((row) => row.id === nodeId) ?? null,
    runDeferredLazyLoadBatch,
    treeRef
  })
  expect(treeData.value[0]!.children).toHaveLength(1)
  expect(openNodeAndParents).toHaveBeenCalledTimes(2)
  expect(listPlacementDocumentChildren).toHaveBeenCalledTimes(2)
})

test('Test that parent document reopen flushes before latent reloads nested descendant rows', async () => {
  const deferLazyLoadTreeRevisionPublish = ref(false)
  const openNodeIds = ref(new Set(['doc-parent', 'doc-nested']))
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([buildDocumentNode()])
  const listPlacementDocumentChildren = vi.fn(async (
    input: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => {
    if (input.parentDocumentId === 'doc-nested') {
      return {
        items: [
          {
            displayName: 'Grandchild doc',
            hasChildren: false,
            id: 'doc-grandchild',
            parentDocumentId: 'doc-nested',
            placementId: 'placement-1',
            sortOrder: 0
          }
        ]
      }
    }
    return {
      items: [
        {
          displayName: 'Nested doc',
          hasChildren: true,
          id: 'doc-nested',
          parentDocumentId: 'doc-parent',
          placementId: 'placement-1',
          sortOrder: 0
        }
      ]
    }
  })
  const lazyLoadWiring = createProjectHierarchyTreeLazyLoadWiring({
    deferLazyLoadTreeRevisionPublish,
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished: vi.fn(),
    shouldDeferTreeRevisionPublish: () => deferLazyLoadTreeRevisionPublish.value,
    suppressTreeEmit: ref(false),
    treeData
  })
  async function runDeferredLazyLoadBatch (runBatch: () => Promise<void>): Promise<void> {
    deferLazyLoadTreeRevisionPublish.value = true
    try {
      await runBatch()
      await lazyLoadWiring.flushDeferredTreeRevisionPublish()
    } finally {
      deferLazyLoadTreeRevisionPublish.value = false
    }
  }
  const parentNode = treeData.value[0]!
  await runProjectHierarchyTreeSessionExpandOpen({
    commitStagedLoadedChildren: lazyLoadWiring.commitStagedLoadedChildren,
    flushDeferredTreeRevisionPublish: lazyLoadWiring.flushDeferredTreeRevisionPublish,
    loadChildrenForNode: lazyLoadWiring.loadChildrenForNode,
    markNodeOpen: vi.fn(),
    node: parentNode,
    reapplyLatentDescendantExpandState: (options) =>
      reapplyProjectHierarchyTreeLatentDescendantExpandState({
        commitStagedLoadedChildren: lazyLoadWiring.commitStagedLoadedChildren,
        getTreeRef: () => null,
        loadChildrenAlongRevealPath: lazyLoadWiring.loadChildrenAlongRevealPath,
        openNodeIds,
        treeData,
        ...(options?.deferHeTreeOpen === true
          ? { reapplyHeTreeOpenAfterEachPass: false }
          : {})
      }),
    resolveTreeNodeById: (nodeId) => treeData.value.find((row) => row.id === nodeId) ?? null,
    runDeferredLazyLoadBatch,
    treeRef: null
  })
  markProjectHierarchyTreeNodeClosed({
    node: treeData.value[0]!,
    nodeId: 'doc-parent',
    openNodeIds,
    queuePersistExpandedNodeIds: vi.fn(),
    treeData
  })
  expect(openNodeIds.value.has('doc-nested')).toBe(true)
  expect(treeData.value[0]!.children).toHaveLength(0)
  listPlacementDocumentChildren.mockClear()
  await runProjectHierarchyTreeSessionExpandOpen({
    commitStagedLoadedChildren: lazyLoadWiring.commitStagedLoadedChildren,
    flushDeferredTreeRevisionPublish: lazyLoadWiring.flushDeferredTreeRevisionPublish,
    loadChildrenForNode: lazyLoadWiring.loadChildrenForNode,
    markNodeOpen: vi.fn(),
    node: treeData.value[0]!,
    reapplyLatentDescendantExpandState: (options) =>
      reapplyProjectHierarchyTreeLatentDescendantExpandState({
        commitStagedLoadedChildren: lazyLoadWiring.commitStagedLoadedChildren,
        getTreeRef: () => null,
        loadChildrenAlongRevealPath: lazyLoadWiring.loadChildrenAlongRevealPath,
        openNodeIds,
        treeData,
        ...(options?.deferHeTreeOpen === true
          ? { reapplyHeTreeOpenAfterEachPass: false }
          : {})
      }),
    resolveTreeNodeById: (nodeId) => treeData.value.find((row) => row.id === nodeId) ?? null,
    runDeferredLazyLoadBatch,
    treeRef: null
  })
  const nestedNode = treeData.value[0]!.children.find((child) => child.id === 'doc-nested')
  expect(nestedNode).toBeDefined()
  expect(nestedNode!.children).toHaveLength(1)
  expect(nestedNode!.children[0]!.id).toBe('doc-grandchild')
  expect(listPlacementDocumentChildren).toHaveBeenCalledWith(
    expect.objectContaining({
      parentDocumentId: 'doc-parent',
      placementId: 'placement-1'
    })
  )
  expect(listPlacementDocumentChildren).toHaveBeenCalledWith(
    expect.objectContaining({
      parentDocumentId: 'doc-nested',
      placementId: 'placement-1'
    })
  )
})
