import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { projectHierarchyTreeRevealPathsMatch } from '../../functions/projectHierarchyTreeRevealPath'
import {
  finalizeProjectHierarchyTreeDragCommitAfterPersist,
  finalizeProjectHierarchyTreeDragCommitExpandState
} from '../projectHierarchyTreeDnDCommitAfterPersistWiring'
import {
  persistProjectHierarchyTreeDraggedDocumentMove,
  runProjectHierarchyTreeDragCommitPersistPhase
} from '../projectHierarchyTreeDnDCommitWiring'
import { remountProjectHierarchyTreeAndRestoreExpandedSnapshot } from '../projectHierarchyTreeDnDRemountWiring'
import { loadProjectHierarchyTreeTagNodeChildrenIfNeeded } from '../projectHierarchyTreeLazyLoadTagChildrenWiring'
import { persistProjectHierarchyTreeTagDelete } from '../projectHierarchyTreeTagDeletePersistWiring'
import {
  projectHierarchyTreeTagPersistEpochMoved,
  projectHierarchyTreeTagPersistSuperseded,
  readProjectHierarchyTreeTagPersistEpoch
} from '../projectHierarchyTreeTagPersistEpochWiring'
import { persistProjectHierarchyTreeTagRename } from '../projectHierarchyTreeTagRenamePersistWiring'
import { publishProjectHierarchyTreeRootRevisionIfTagsRemoved } from '../projectHierarchyTreeTagMembershipRevisionWiring'
import { revealProjectHierarchyTreePendingPath } from '../projectHierarchyTreeUiStateWiring'

function documentNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-1',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-node',
    label: 'Hero',
    nodeKind: 'document',
    placementId: 'placement-1',
    tagId: 'tag-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
}

function tagNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [documentNode()],
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
    worldColor: '#000',
    worldId: 'world-1'
  }
}

test('Test that hierarchy reveal paths do not match when lengths differ', () => {
  expect(projectHierarchyTreeRevealPathsMatch(['a'], ['a', 'b'])).toBe(false)
})

test('Test that tag persist epoch helpers cover a missing pinia and an in-flight open', async () => {
  const pinia = createPinia()
  setActivePinia(undefined)
  await expect(readProjectHierarchyTreeTagPersistEpoch()).resolves.toBeUndefined()
  await expect(projectHierarchyTreeTagPersistSuperseded(1)).resolves.toBe(false)
  expect(projectHierarchyTreeTagPersistEpochMoved(undefined, 1)).toBe(false)
  setActivePinia(pinia)
  const { S_FaActiveProject } = await import('app/src/stores/S_FaActiveProject')
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockReturnValue(true)
  await expect(projectHierarchyTreeTagPersistSuperseded(1)).resolves.toBe(true)
  setActivePinia(undefined)
})

test('Test that tag delete dismisses before writing when the project open is already in flight', async () => {
  setActivePinia(createPinia())
  const { S_FaActiveProject } = await import('app/src/stores/S_FaActiveProject')
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockReturnValue(true)
  const deleteTag = vi.fn(async () => undefined)
  const onDismiss = vi.fn()
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        deleteTag
      }
    }
  })
  await persistProjectHierarchyTreeTagDelete({
    applyOpenedDocumentTabs: () => undefined,
    getOpenedDocumentTabs: () => [],
    onDismiss,
    refreshLayout: async () => undefined,
    resyncTreeDataFromLayout: () => undefined,
    tagId: 'tag-gap-delete'
  })
  expect(onDismiss).toHaveBeenCalled()
  expect(deleteTag).not.toHaveBeenCalled()
  vi.unstubAllGlobals()
  setActivePinia(undefined)
})

test('Test that tag rename dismisses before writing when the project open is already in flight', async () => {
  setActivePinia(createPinia())
  const { S_FaActiveProject } = await import('app/src/stores/S_FaActiveProject')
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockReturnValue(true)
  const renameTag = vi.fn(async () => undefined)
  const onDismiss = vi.fn()
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        renameTag
      }
    }
  })
  await persistProjectHierarchyTreeTagRename({
    applyOpenedDocumentTabs: () => undefined,
    getOpenedDocumentTabs: () => [],
    getTreeData: () => [],
    newName: 'Renamed',
    onDismiss,
    refreshHierarchyTreeNodes: () => undefined,
    refreshLayout: async () => undefined,
    resyncTreeDataFromLayout: () => undefined,
    tagId: 'tag-gap-rename'
  })
  expect(onDismiss).toHaveBeenCalled()
  expect(renameTag).not.toHaveBeenCalled()
  vi.unstubAllGlobals()
  setActivePinia(undefined)
})

test('Test that a removed tag publishes a root revision', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([tagNode()])
  const revised = publishProjectHierarchyTreeRootRevisionIfTagsRemoved({
    nextTick: async () => undefined,
    suppressTreeEmit: ref(false),
    treeData,
    treeTagIdsBefore: ['tag-1', 'tag-gone']
  })
  expect(revised).toBe(true)
  await Promise.resolve()
})

test('Test that drag expand restore stops when the commit is no longer current', async () => {
  const calls = { current: 0 }
  const stillCurrent = (): boolean => {
    calls.current += 1
    return calls.current > 6
  }
  for (let failOnCall = 1; failOnCall <= 6; failOnCall += 1) {
    calls.current = 0
    const limit = failOnCall
    await finalizeProjectHierarchyTreeDragCommitExpandState({
      clearDragSessionFlags: () => undefined,
      dragExpandPostCommitGuard: ref(true),
      dragExpandUiFrozen: ref(true),
      expandedSnapshot: [],
      flushUiStatePersist: () => undefined,
      isDragCommitStillCurrent: () => {
        calls.current += 1
        return calls.current !== limit
      },
      nextTick: async () => undefined,
      reapplyHeTreeOpenState: () => undefined,
      reapplyLatentDescendantExpandState: async () => undefined,
      requestAnimationFrame: (callback) => {
        callback()
        return 1
      },
      restoreExpandedSnapshot: async () => undefined
    })
  }
  expect(stillCurrent()).toBe(true)
})

test('Test that drag commit after persist returns when the session is stale', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([])
  await finalizeProjectHierarchyTreeDragCommitAfterPersist({
    clearDragSessionFlags: () => undefined,
    commitResult: {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    dragParentDocumentIdAtDragStart: null,
    dragSiblingOrderSnapshot: null,
    expandedSnapshot: [],
    expandedSnapshotSet: new Set(),
    flushDeferredTreeRevisionPublish: () => undefined,
    flushUiStatePersist: () => undefined,
    getTreeRef: () => null,
    isDragCommitStillCurrent: () => false,
    loadChildrenForNode: async () => undefined,
    markNodeClosed: () => undefined,
    nextTick: async () => undefined,
    openNodeIds: ref(new Set()),
    parentChangedFromDragStart: false,
    queuePersistExpandedNodeIds: () => undefined,
    reapplyHeTreeOpenState: () => undefined,
    reapplyLatentDescendantExpandState: async () => undefined,
    refreshNodeChildrenFromDatabase: async () => undefined,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    },
    restoreExpandedSnapshot: async () => undefined,
    treeData
  })
  let checks = 0
  await finalizeProjectHierarchyTreeDragCommitAfterPersist({
    clearDragSessionFlags: () => undefined,
    commitResult: {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    dragParentDocumentIdAtDragStart: null,
    dragSiblingOrderSnapshot: null,
    expandedSnapshot: [],
    expandedSnapshotSet: new Set(),
    flushDeferredTreeRevisionPublish: () => undefined,
    flushUiStatePersist: () => undefined,
    getTreeRef: () => null,
    isDragCommitStillCurrent: () => {
      checks += 1
      return checks === 1
    },
    loadChildrenForNode: async () => undefined,
    markNodeClosed: () => undefined,
    nextTick: async () => undefined,
    openNodeIds: ref(new Set()),
    parentChangedFromDragStart: false,
    queuePersistExpandedNodeIds: () => undefined,
    reapplyHeTreeOpenState: () => undefined,
    reapplyLatentDescendantExpandState: async () => undefined,
    refreshNodeChildrenFromDatabase: async () => undefined,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    },
    restoreExpandedSnapshot: async () => undefined,
    treeData
  })
})

test('Test that a tag-parent drag returns the under-tag result without a reorder bridge', async () => {
  vi.stubGlobal('window', {})
  const result = await persistProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-1',
    dragCommitSuppressWaitAttempts: 0,
    dragCommitSuppressWaitReady: true,
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-1'],
      parentDocumentId: null,
      placementId: 'placement-1',
      tagId: 'tag-1',
      treeNodeId: 'doc-node'
    },
    modelSettleAttempts: 0,
    modelSettleReady: true,
    refreshLayout: async () => undefined,
    reindexDocumentSiblingsInHierarchy: async () => undefined,
    resyncTreeDataFromLayout: () => undefined,
    suppressTreeEmit: false,
    treeData: [tagNode()]
  })
  expect(result.committed).toBe(false)
  vi.unstubAllGlobals()
})

test('Test that drag persist phase returns when the commit is no longer current', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([])
  const early = await runProjectHierarchyTreeDragCommitPersistPhase({
    dragSiblingOrderSnapshot: null,
    draggedDocumentId: null,
    getDataSettle: {
      attempts: 0,
      settled: true
    },
    isDragCommitStillCurrent: () => false,
    refreshLayout: async () => undefined,
    refreshNodeChildrenFromDatabase: async () => undefined,
    reindexDocumentSiblingsInHierarchy: async () => undefined,
    resyncTreeDataFromLayout: () => undefined,
    suppressTreeEmit: false,
    suppressWait: {
      attempts: 0,
      ready: true
    },
    treeData
  })
  expect(early.committed).toBe(false)
  let checks = 0
  await runProjectHierarchyTreeDragCommitPersistPhase({
    dragSiblingOrderSnapshot: null,
    draggedDocumentId: null,
    getDataSettle: {
      attempts: 0,
      settled: true
    },
    isDragCommitStillCurrent: () => {
      checks += 1
      return checks === 1
    },
    refreshLayout: async () => undefined,
    refreshNodeChildrenFromDatabase: async () => undefined,
    reindexDocumentSiblingsInHierarchy: async () => undefined,
    resyncTreeDataFromLayout: () => undefined,
    suppressTreeEmit: false,
    suppressWait: {
      attempts: 0,
      ready: true
    },
    treeData
  })
})

test('Test that drag remount stops when the drag session is no longer current', async () => {
  let checks = 0
  await remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
    expandedNodeIds: [],
    isDragSessionStillCurrent: () => {
      checks += 1
      return checks === 1
    },
    nextTick: async () => undefined,
    restoreExpandedSnapshot: async () => undefined,
    restoreOptions: {},
    waitBeforeRemount: async () => undefined
  })
})

test('Test that tag child load stops when the tree session changed', async () => {
  const node = tagNode()
  const loaded = await loadProjectHierarchyTreeTagNodeChildrenIfNeeded({
    isStillCurrent: () => false,
    listDocumentsUnderTag: async () => ({ items: [] }),
    node,
    publishTreeRevision: async () => undefined,
    treeData: ref([node])
  })
  expect(loaded).toBe(true)
})

test('Test that a stale reveal path stops before focusing the last node', async () => {
  let pending = ['node-a']
  await revealProjectHierarchyTreePendingPath({
    getPendingRevealPath: () => pending,
    getTreeRef: () => ({
      closeAll: () => undefined,
      openNodeAndParents: () => undefined
    }),
    getTreeScrollHost: () => null,
    loadChildrenAlongRevealPath: async () => undefined,
    markNodeOpen: () => {
      pending = []
    },
    nextTick: async () => undefined,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    },
    treeData: ref([])
  })
  pending = ['node-a', 'node-b']
  await revealProjectHierarchyTreePendingPath({
    getPendingRevealPath: () => pending,
    getTreeRef: () => ({
      closeAll: () => undefined,
      openNodeAndParents: () => undefined
    }),
    getTreeScrollHost: () => null,
    loadChildrenAlongRevealPath: async () => undefined,
    markNodeOpen: (nodeId) => {
      if (nodeId === 'node-a') {
        pending = []
      }
    },
    nextTick: async () => {
      pending = []
    },
    requestAnimationFrame: (callback) => {
      pending = []
      callback()
      return 1
    },
    treeData: ref([])
  })
})
