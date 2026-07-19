import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { mapWorkspaceLayoutToHierarchyTreeSkeleton } from '../projectHierarchyTreeMapperWiring'
import { createProjectHierarchyTreeSessionHandlersWiring } from '../projectHierarchyTreeSessionHandlersWiring'
import { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from '../projectHierarchyTreeDocumentRowExpandClickGestureWiring'

function createTestDocumentRowExpandClickGesture () {
  return createProjectHierarchyTreeDocumentRowExpandClickGestureWiring({
    isTreeDragActive: ref(false)
  })
}

function createTestDocumentRowDragHoldWiring () {
  return {
    clearHoldSession: vi.fn(),
    getIsDragHoldArmed: () => true,
    handleDocumentRowPointerDown: vi.fn(),
    handleTreeDragStartCapture: vi.fn(),
    markDragStartedFromHold: vi.fn()
  }
}

function buildPointerLikeEvent (clientX: number, clientY: number) {
  return {
    clientX,
    clientY,
    stopPropagation: vi.fn()
  }
}

function createTestUiStateWiring (overrides: {
  markNodeClosed?: ReturnType<typeof vi.fn>
  markNodeOpen?: ReturnType<typeof vi.fn>
  reapplyHeTreeOpenState?: ReturnType<typeof vi.fn>
  reapplyLatentDescendantExpandState?: ReturnType<typeof vi.fn>
  resyncHeTreeAfterExpandPublish?: ReturnType<typeof vi.fn>
} = {}): Parameters<typeof createProjectHierarchyTreeSessionHandlersWiring>[0]['uiStateWiring'] {
  const markNodeClosed = overrides.markNodeClosed ?? vi.fn()
  const markNodeOpen = overrides.markNodeOpen ?? vi.fn()
  const reapplyHeTreeOpenState = overrides.reapplyHeTreeOpenState ?? vi.fn()
  const reapplyLatentDescendantExpandState =
    overrides.reapplyLatentDescendantExpandState ?? vi.fn(async () => undefined)
  const resyncHeTreeAfterExpandPublish =
    overrides.resyncHeTreeAfterExpandPublish ?? vi.fn(async () => undefined)
  return {
    awaitHeTreeResyncIdle: async () => undefined,
    isProgrammaticHeTreeResyncActive: () => false,
    markNodeClosed,
    markNodeOpen,
    reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState,
    resyncHeTreeAfterExpandPublish
  } as Parameters<typeof createProjectHierarchyTreeSessionHandlersWiring>[0]['uiStateWiring']
}

function createTestRunDeferredLazyLoadBatch (reapplyHeTreeOpenState: () => void = vi.fn()) {
  return vi.fn(async (runBatch: () => Promise<void>) => {
    await runBatch()
    reapplyHeTreeOpenState()
  })
}

function createTestBulkExpandDeps (options: {
  reapplyHeTreeOpenState?: () => void
} = {}): Pick<
  Parameters<typeof createProjectHierarchyTreeSessionHandlersWiring>[0],
  'nextTick' | 'openIconExpandAnimationWiring' | 'openNodeIds' | 'queuePersistExpandedNodeIds' | 'runDeferredLazyLoadBatch' | 'treeMountKey'
> {
  const reapplyHeTreeOpenState = options.reapplyHeTreeOpenState ?? vi.fn()
  return {
    nextTick: async () => {},
    openIconExpandAnimationWiring: {
      scheduleOpenIconExpandAnimation: vi.fn()
    },
    openNodeIds: ref<Set<string>>(new Set()),
    queuePersistExpandedNodeIds: vi.fn(),
    runDeferredLazyLoadBatch: createTestRunDeferredLazyLoadBatch(reapplyHeTreeOpenState),
    treeMountKey: ref(0)
  }
}

function createTestTreeComponentRef () {
  return ref({
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  } as unknown as I_faProjectHierarchyTreeHeTreeInstance)
}

const sampleWorld = {
  color: '#ff0000',
  colorPallete: '',
  displayName: 'World A',
  groups: [],
  id: 'world-1',
  placements: [
    {
      displayName: 'Character',
      documentTemplateId: 'template-1',
      groupId: null,
      groupSortOrder: null,
      hasChildren: true,
      icon: 'mdi-account',
      id: 'placement-1',
      nickname: '',
      titlePluralTranslations: {},
      titleSingularTranslations: {},
      rootSortOrder: 0,
      isCategory: false,
      worldId: 'world-1'
    }
  ],
  sortOrder: 0
}

/**
 * createProjectHierarchyTreeSessionHandlersWiring opens nodes and loads children.
 */
test('Test that session handlers open nodes and load children', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  const loadChildrenForNode = vi.fn(async () => undefined)
  const markNodeOpen = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({ markNodeOpen })
  })
  await wiring.onNodeOpen({ data: placement })
  expect(markNodeOpen).toHaveBeenCalledWith('placement-1')
  expect(loadChildrenForNode).toHaveBeenCalledWith(placement)
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring loads children when the open icon expands a row.
 */
test('Test that session handlers load children when the open icon expands a row', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  const loadChildrenForNode = vi.fn(async () => undefined)
  const markNodeOpen = vi.fn()
  const markNodeClosed = vi.fn()
  const resyncHeTreeAfterExpandPublish = vi.fn(async () => undefined)
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref({
      closeAll: vi.fn(),
      openNodeAndParents: vi.fn()
    } as unknown as I_faProjectHierarchyTreeHeTreeInstance),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({
      markNodeClosed,
      markNodeOpen,
      resyncHeTreeAfterExpandPublish
    })
  })
  const stat = {
    children: [],
    open: false
  }
  wiring.onNodeOpenIconPointerDown(stat)
  await wiring.onNodeOpenIconClick(placement, stat)
  expect(resyncHeTreeAfterExpandPublish).toHaveBeenCalledWith('placement-1')
  expect(markNodeOpen).toHaveBeenCalledWith('placement-1')
  expect(loadChildrenForNode).toHaveBeenCalledWith(placement)
})

/**
 * Open icon expand keeps stat closed until lazy load finishes, then resyncHeTreeAfterExpandPublish runs.
 */
test('Test that open icon expand runs resync after lazy load finishes', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  placement.childrenLoaded = false
  placement.children = []
  const loadChildrenForNode = vi.fn(async () => undefined)
  const openNodeAndParents = vi.fn()
  const resyncHeTreeAfterExpandPublish = vi.fn(async () => undefined)
  const scheduleOpenIconExpandAnimation = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode
    },
    ...createTestBulkExpandDeps(),
    openIconExpandAnimationWiring: {
      scheduleOpenIconExpandAnimation
    },
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref({
      closeAll: vi.fn(),
      openNodeAndParents
    } as unknown as I_faProjectHierarchyTreeHeTreeInstance),
    treeData: ref(tree),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({
      resyncHeTreeAfterExpandPublish
    })
  })
  const stat = {
    children: placement.children,
    open: false
  }
  wiring.onNodeOpenIconPointerDown(stat)
  await wiring.onNodeOpenIconClick(placement, stat)
  expect(scheduleOpenIconExpandAnimation).toHaveBeenCalledWith('placement-1')
  expect(loadChildrenForNode).toHaveBeenCalled()
  expect(resyncHeTreeAfterExpandPublish).toHaveBeenCalledWith('placement-1')
  expect(openNodeAndParents).toHaveBeenCalledWith(placement)
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring collapses rows when the open icon is clicked on an open node.
 */
test('Test that session handlers collapse rows via the open icon', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  const markNodeClosed = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({
      markNodeClosed,
      markNodeOpen: vi.fn()
    })
  })
  const stat = {
    children: [],
    open: true
  }
  wiring.onNodeOpenIconPointerDown(stat)
  await wiring.onNodeOpenIconClick(placement, stat)
  expect(stat.open).toBe(false)
  expect(markNodeClosed).toHaveBeenCalledWith('placement-1', placement)
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring expands world rows from row click routing.
 */
test('Test that session handlers expand world rows from row click routing', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const worldNode = tree[0]!
  const loadChildrenForNode = vi.fn(async () => undefined)
  const markNodeOpen = vi.fn()
  const openNodeAndParents = vi.fn()
  const reapplyLatentDescendantExpandState = vi.fn(async () => undefined)
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref({
      closeAll: vi.fn(),
      openNodeAndParents
    } as unknown as I_faProjectHierarchyTreeHeTreeInstance),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({
      markNodeOpen,
      reapplyLatentDescendantExpandState
    })
  })
  const stat = {
    children: [],
    open: false
  }
  const stopPropagation = vi.fn()
  wiring.onWorldNodeRowPointerDown(worldNode, stat, {
    stopPropagation
  } as unknown as PointerEvent)
  await wiring.onWorldNodeRowClick(worldNode, stat, {
    stopPropagation
  } as unknown as MouseEvent)
  expect(stopPropagation).toHaveBeenCalledTimes(2)
  expect(openNodeAndParents).toHaveBeenCalledWith(worldNode)
  expect(markNodeOpen).toHaveBeenCalledWith('world-1')
  expect(loadChildrenForNode).toHaveBeenCalledWith(worldNode)
  expect(reapplyLatentDescendantExpandState).toHaveBeenCalledTimes(2)
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring expands group rows from row click routing.
 */
test('Test that session handlers expand group rows from row click routing', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([{
    ...sampleWorld,
    groups: [
      {
        displayName: 'Group A',
        hasChildren: true,
        id: 'group-1',
        rootSortOrder: 0,
        worldId: 'world-1'
      }
    ],
    placements: []
  }])
  const worldNode = tree[0]!
  const groupNode = worldNode.children[0]!
  const markNodeOpen = vi.fn()
  const openNodeAndParents = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref({
      closeAll: vi.fn(),
      openNodeAndParents
    } as unknown as I_faProjectHierarchyTreeHeTreeInstance),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({ markNodeOpen })
  })
  const stat = {
    children: [],
    open: false
  }
  const stopPropagation = vi.fn()
  wiring.onWorldNodeRowPointerDown(groupNode, stat, {
    stopPropagation
  } as unknown as PointerEvent)
  await wiring.onWorldNodeRowClick(groupNode, stat, {
    stopPropagation
  } as unknown as MouseEvent)
  expect(stopPropagation).toHaveBeenCalledTimes(2)
  expect(openNodeAndParents).toHaveBeenCalledWith(groupNode)
  expect(markNodeOpen).toHaveBeenCalledWith('group-1')
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring expands document rows with children from row click routing.
 */
test('Test that session handlers expand document rows with children from row click routing', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  const documentNode = {
    children: [],
    childrenLoaded: false,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: true,
    icon: 'mdi-file',
    id: 'doc-parent',
    label: 'Parent Doc',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
  placement.children = [documentNode]
  const markNodeOpen = vi.fn()
  const openNodeAndParents = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref({
      closeAll: vi.fn(),
      openNodeAndParents
    } as unknown as I_faProjectHierarchyTreeHeTreeInstance),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({ markNodeOpen })
  })
  const stat = {
    children: [],
    open: false
  }
  const stopPropagation = vi.fn()
  const pointerDownEvent = buildPointerLikeEvent(20, 30)
  const clickEvent = buildPointerLikeEvent(20, 30)
  pointerDownEvent.stopPropagation = stopPropagation
  clickEvent.stopPropagation = stopPropagation
  wiring.onWorldNodeRowPointerDown(documentNode, stat, pointerDownEvent as unknown as PointerEvent)
  await wiring.onWorldNodeRowClick(documentNode, stat, clickEvent as unknown as MouseEvent)
  expect(stopPropagation).toHaveBeenCalledTimes(1)
  expect(openNodeAndParents).toHaveBeenCalledWith(documentNode)
  expect(markNodeOpen).toHaveBeenCalledWith('doc-parent')
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring ignores leaf document row click routing.
 */
test('Test that session handlers ignore leaf document row click routing', async () => {
  const documentNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-1',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-1',
    label: 'Doc',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const markNodeOpen = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({ markNodeOpen })
  })
  const stat = {
    children: [],
    open: false
  }
  const stopPropagation = vi.fn()
  wiring.onWorldNodeRowPointerDown(documentNode, stat, {
    stopPropagation
  } as unknown as PointerEvent)
  await wiring.onWorldNodeRowClick(documentNode, stat, {
    stopPropagation
  } as unknown as MouseEvent)
  expect(stopPropagation).not.toHaveBeenCalled()
  expect(markNodeOpen).not.toHaveBeenCalled()
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring ignores document row click after drag movement.
 */
test('Test that session handlers ignore document row click after drag movement', async () => {
  const documentNode = {
    children: [],
    childrenLoaded: false,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: true,
    icon: 'mdi-file',
    id: 'doc-parent',
    label: 'Parent Doc',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
  const markNodeOpen = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({ markNodeOpen })
  })
  const stat = {
    children: [],
    open: false
  }
  const stopPropagation = vi.fn()
  wiring.onWorldNodeRowPointerDown(
    documentNode,
    stat,
    buildPointerLikeEvent(0, 0) as unknown as PointerEvent
  )
  await wiring.onWorldNodeRowClick(
    documentNode,
    stat,
    buildPointerLikeEvent(20, 0) as unknown as MouseEvent
  )
  expect(stopPropagation).not.toHaveBeenCalled()
  expect(markNodeOpen).not.toHaveBeenCalled()
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring ignores non-world open icon routing on world rows.
 */
test('Test that session handlers ignore non-world open icon routing on world rows', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const worldNode = tree[0]!
  const markNodeOpen = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({ markNodeOpen })
  })
  const stat = {
    children: [],
    open: false
  }
  wiring.onNonWorldOpenIconPointerDown(worldNode, stat)
  await wiring.onNonWorldOpenIconClick(worldNode, stat)
  expect(markNodeOpen).not.toHaveBeenCalled()
})

test('Test that session handlers reopen he-tree row after lazy load when tree ref is set', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  const openNodeAndParents = vi.fn()
  const reapplyHeTreeOpenState = vi.fn(() => {
    openNodeAndParents(placement)
  })
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps({ reapplyHeTreeOpenState }),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref({
      closeAll: vi.fn(),
      openNodeAndParents
    }),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({ reapplyHeTreeOpenState })
  })
  await wiring.onNodeOpen({ data: placement })
  expect(openNodeAndParents).toHaveBeenCalledWith(placement)
})

test('Test that session handlers ignore he-tree close events while suppressTreeEmit is set', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  const markNodeClosed = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(true),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({
      markNodeClosed,
      markNodeOpen: vi.fn()
    })
  })
  wiring.onNodeClose({ data: placement })
  expect(markNodeClosed).not.toHaveBeenCalled()
})

test('Test that open icon collapse still persists while suppressTreeEmit is set', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  const markNodeClosed = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(true),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref(tree),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({
      markNodeClosed,
      markNodeOpen: vi.fn()
    })
  })
  const stat = {
    children: placement.children,
    open: true
  }
  wiring.onNodeOpenIconPointerDown(stat)
  await wiring.onNodeOpenIconClick(placement, stat)
  expect(markNodeClosed).toHaveBeenCalledTimes(1)
})

test('Test that session handlers emit document open requests for leaf document rows', () => {
  const onDocumentOpenRequest = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest,
    suppressTreeEmit: ref(false),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring()
  })
  wiring.onNodeClick({
    data: {
      children: [],
      childrenLoaded: true,
      documentId: 'doc-1',
      groupId: null,
      hasChildren: false,
      icon: 'mdi-feather',
      id: 'doc-1',
      label: 'Doc',
      nodeKind: 'document',
      placementId: 'placement-1',
      worldColor: '#000',
      worldId: 'world-1'
    },
    children: []
  })
  wiring.onNodeClick({
    data: mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])[0]!
  })
  expect(onDocumentOpenRequest).toHaveBeenCalledTimes(1)
  expect(onDocumentOpenRequest).toHaveBeenCalledWith(
    'doc-1',
    'leftNavigate',
    {
      tabLabel: 'Doc',
      templateIcon: 'mdi-feather'
    }
  )
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring wires draggable and droppable handlers.
 */
test('Test that session handlers expose draggable and droppable handlers', () => {
  const parentDocument = {
    children: [] as I_faProjectHierarchyTreeHeTreeNode[],
    childrenLoaded: true,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'doc-parent',
    label: 'Parent',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const documentNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-1',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-1',
    label: 'Doc',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const siblingDocument = {
    ...documentNode,
    documentId: 'doc-2',
    id: 'doc-2',
    label: 'Doc 2'
  }
  parentDocument.children = [documentNode, siblingDocument]
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  placement.children = [parentDocument]
  placement.childrenLoaded = true
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: {
        data: documentNode
      }
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref(tree),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring()
  })
  expect(wiring.eachDraggableHandler({ data: documentNode })).toBe(true)
  expect(wiring.rootDroppableHandler()).toBe(false)
  expect(wiring.eachDroppableHandler({ data: documentNode })).toBe(false)
  expect(wiring.eachDroppableHandler({ data: siblingDocument })).toBe(true)
  const siblingSection = {
    ...documentNode,
    documentId: 'doc-section',
    hasChildren: true,
    id: 'doc-section',
    label: 'Section'
  }
  expect(wiring.eachDroppableHandler({ data: siblingSection })).toBe(true)
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring only stores the tree ref on attach (hydrate restores expand).
 */
test('Test that session handlers do not restore UI state when tree ref attaches', () => {
  const treeComponentRef = ref<I_faProjectHierarchyTreeHeTreeInstance | null>(null)
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef,
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring()
  })
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  wiring.setTreeComponentRef(treeRef as I_faProjectHierarchyTreeHeTreeInstance)
  expect(treeComponentRef.value).toStrictEqual(treeRef)
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring ignores expand handlers while drag UI is frozen.
 */
test('Test that session handlers ignore expand events while drag expand UI is frozen', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  const markNodeOpen = vi.fn()
  const markNodeClosed = vi.fn()
  const loadChildrenForNode = vi.fn(async () => undefined)
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandUiFrozen: ref(true),
    dragExpandPostCommitGuard: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({
      markNodeClosed,
      markNodeOpen
    })
  })
  await wiring.onNodeOpen({ data: placement })
  wiring.onNodeClose({ data: placement })
  const stat = {
    children: [],
    open: false
  }
  wiring.onNodeOpenIconPointerDown(stat)
  await wiring.onNodeOpenIconClick(placement, stat)
  expect(markNodeOpen).not.toHaveBeenCalled()
  expect(markNodeClosed).not.toHaveBeenCalled()
  expect(loadChildrenForNode).not.toHaveBeenCalled()
  expect(stat.open).toBe(false)
})

test('Test that session handlers skip restore when tree ref attaches during drag expand freeze', () => {
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandUiFrozen: ref(true),
    dragExpandPostCommitGuard: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: async () => undefined
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring()
  })
  wiring.setTreeComponentRef({
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  })
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring does not restore UI state when tree ref clears.
 */
test('Test that session handlers skip restore when tree ref clears', () => {
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring()
  })
  wiring.setTreeComponentRef(null)
})

test('Test that session handlers ignore open icon clicks on empty loaded documents', async () => {
  const documentNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'doc-parent',
    label: 'Parent',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const markNodeOpen = vi.fn()
  const loadChildrenForNode = vi.fn(async () => undefined)
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: createTestTreeComponentRef(),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring({ markNodeOpen })
  })
  const stat = {
    children: [],
    open: false
  }
  wiring.onNodeOpenIconPointerDown(stat)
  await wiring.onNodeOpenIconClick(documentNode, stat)
  expect(markNodeOpen).not.toHaveBeenCalled()
  expect(loadChildrenForNode).not.toHaveBeenCalled()
})

test('Test that session handlers keep stat closed when fresh he-tree sync fails after deferred batch', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  const stat = {
    children: [],
    open: false
  }
  const openNodeAndParents = vi.fn(() => {
    const error = new Error('Stat not found')
    error.name = 'StatNotFoundError'
    throw error
  })
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    onDocumentOpenRequest: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref({
      closeAll: vi.fn(),
      openNodeAndParents
    }),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring()
  })
  wiring.onNodeOpenIconPointerDown(stat)
  await wiring.onNodeOpenIconClick(placement, stat)
  expect(openNodeAndParents).toHaveBeenCalledWith(placement)
  expect(stat.open).toBe(false)
})

test('Test that session handlers create temporary document when add-new row is clicked', () => {
  const createTemporaryDocument = vi.fn(async () => 'temp-doc')
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    onDocumentOpenRequest: vi.fn(),
    ...createTestBulkExpandDeps(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref(null),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: createTestUiStateWiring()
  })
  wiring.onNodeClick({
    children: [],
    data: {
      children: [],
      childrenLoaded: true,
      documentId: null,
      documentTemplateId: 'template-1',
      groupId: null,
      hasChildren: false,
      icon: 'mdi-plus',
      id: 'placement-1__add-new',
      label: 'Add new character',
      nodeKind: 'addNewDocument',
      placementId: 'placement-1',
      titlePluralTranslations: { 'en-US': 'Characters' },
      titleSingularTranslations: { 'en-US': 'Character' },
      worldColor: '#336699',
      worldId: 'world-1'
    }
  })
  expect(createTemporaryDocument).toHaveBeenCalledWith({
    displayName: 'New character',
    openMode: 'leftNavigate',
    parentDocumentId: null,
    templateId: 'template-1',
    worldId: 'world-1'
  })
})
