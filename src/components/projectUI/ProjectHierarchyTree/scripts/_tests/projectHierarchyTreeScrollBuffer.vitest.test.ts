/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'

import {
  isProjectHierarchyTreeScrollPreserveActive,
  resetProjectHierarchyTreeScrollPreserveForTests,
  runWithPreservedProjectHierarchyTreeScrollTop
} from '../projectHierarchyTreeScrollPreserveWiring'
import { applyProjectHierarchyTreeVirtualListDefaults } from '../projectHierarchyTreeVirtualListBufferWiring'
import {
  PROJECT_HIERARCHY_TREE_VIRTUAL_LIST_BUFFER_PX,
  PROJECT_HIERARCHY_TREE_VIRTUAL_ROW_SIZE_PX
} from '../../functions/projectHierarchyTreeConstants'
import { requestProjectHierarchyTreeVirtualListUpdate } from '../../functions/projectHierarchyTreeVirtualListUpdate'
import VirtualList from '@virtual-list/vue'

test('Test that resetProjectHierarchyTreeScrollPreserveForTests clears active preserve depth', async () => {
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  host.appendChild(tree)
  let releaseNested!: () => void
  const nestedGate = new Promise<void>((resolve) => {
    releaseNested = resolve
  })
  const preservePromise = runWithPreservedProjectHierarchyTreeScrollTop({
    getTreeScrollHost: () => host,
    nextTick: async () => undefined,
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    run: async () => {
      expect(isProjectHierarchyTreeScrollPreserveActive()).toBe(true)
      await nestedGate
    }
  })
  expect(isProjectHierarchyTreeScrollPreserveActive()).toBe(true)
  resetProjectHierarchyTreeScrollPreserveForTests()
  expect(isProjectHierarchyTreeScrollPreserveActive()).toBe(false)
  releaseNested()
  await preservePromise
  resetProjectHierarchyTreeScrollPreserveForTests()
})

test('Test that runWithPreservedProjectHierarchyTreeScrollTop restores scroll after work', async () => {
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  Object.defineProperty(tree, 'scrollTop', {
    configurable: true,
    value: 240,
    writable: true
  })
  host.appendChild(tree)
  await runWithPreservedProjectHierarchyTreeScrollTop({
    getTreeScrollHost: () => host,
    nextTick: async () => undefined,
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    run: async () => {
      tree.scrollTop = 0
    }
  })
  expect(tree.scrollTop).toBe(240)
})

test('Test that runWithPreservedProjectHierarchyTreeScrollTop recovers from Illegal invocation rAF', async () => {
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  Object.defineProperty(tree, 'scrollTop', {
    configurable: true,
    value: 120,
    writable: true
  })
  host.appendChild(tree)
  const windowRafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(performance.now())
    return 0
  })
  await runWithPreservedProjectHierarchyTreeScrollTop({
    getTreeScrollHost: () => host,
    nextTick: async () => undefined,
    requestAnimationFrame: () => {
      throw new TypeError('Illegal invocation')
    },
    run: async () => {
      tree.scrollTop = 0
    }
  })
  expect(tree.scrollTop).toBe(120)
  expect(windowRafSpy).toHaveBeenCalled()
  windowRafSpy.mockRestore()
})

test('Test that runWithPreservedProjectHierarchyTreeScrollTop locks scroll during work', async () => {
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  Object.defineProperty(tree, 'scrollTop', {
    configurable: true,
    value: 180,
    writable: true
  })
  host.appendChild(tree)
  let midWorkScrollTop = -1
  await runWithPreservedProjectHierarchyTreeScrollTop({
    getTreeScrollHost: () => host,
    nextTick: async () => undefined,
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    settleFrameCount: 1,
    run: async () => {
      tree.scrollTop = 0
      tree.dispatchEvent(new Event('scroll'))
      midWorkScrollTop = tree.scrollTop
    }
  })
  expect(midWorkScrollTop).toBe(180)
  expect(tree.scrollTop).toBe(180)
})

test('Test that nested runWithPreservedProjectHierarchyTreeScrollTop does not double-restore', async () => {
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  Object.defineProperty(tree, 'scrollTop', {
    configurable: true,
    value: 200,
    writable: true
  })
  host.appendChild(tree)
  let innerSawScrollTop = -1
  await runWithPreservedProjectHierarchyTreeScrollTop({
    getTreeScrollHost: () => host,
    nextTick: async () => undefined,
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    settleFrameCount: 1,
    run: async () => {
      await runWithPreservedProjectHierarchyTreeScrollTop({
        getTreeScrollHost: () => host,
        nextTick: async () => undefined,
        requestAnimationFrame: (callback) => {
          callback()
          return 0
        },
        scrollTopPx: 999,
        settleFrameCount: 1,
        run: async () => {
          tree.scrollTop = 0
          innerSawScrollTop = tree.scrollTop
        }
      })
    }
  })
  expect(innerSawScrollTop).toBe(0)
  expect(tree.scrollTop).toBe(200)
})

test('Test that runWithPreservedProjectHierarchyTreeScrollTop follows remounted scroll container', async () => {
  const host = document.createElement('div')
  const firstTree = document.createElement('div')
  firstTree.className = 'projectHierarchyTree'
  Object.defineProperty(firstTree, 'scrollTop', {
    configurable: true,
    value: 300,
    writable: true
  })
  host.appendChild(firstTree)
  const secondTree = document.createElement('div')
  secondTree.className = 'projectHierarchyTree'
  Object.defineProperty(secondTree, 'scrollTop', {
    configurable: true,
    value: 0,
    writable: true
  })
  await runWithPreservedProjectHierarchyTreeScrollTop({
    getTreeScrollHost: () => host,
    nextTick: async () => undefined,
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    settleFrameCount: 1,
    run: async () => {
      host.removeChild(firstTree)
      host.appendChild(secondTree)
    }
  })
  expect(secondTree.scrollTop).toBe(300)
})

test('Test that touchProjectHierarchyTreePreservedScrollTop rebinds remounted container during preserve', async () => {
  const { touchProjectHierarchyTreePreservedScrollTop } = await import(
    '../projectHierarchyTreeScrollPreserveWiring'
  )
  const host = document.createElement('div')
  const firstTree = document.createElement('div')
  firstTree.className = 'projectHierarchyTree'
  Object.defineProperty(firstTree, 'scrollTop', {
    configurable: true,
    value: 250,
    writable: true
  })
  host.appendChild(firstTree)
  const secondTree = document.createElement('div')
  secondTree.className = 'projectHierarchyTree'
  Object.defineProperty(secondTree, 'scrollTop', {
    configurable: true,
    value: 0,
    writable: true
  })
  await runWithPreservedProjectHierarchyTreeScrollTop({
    getTreeScrollHost: () => host,
    nextTick: async () => undefined,
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    settleFrameCount: 1,
    run: async () => {
      host.removeChild(firstTree)
      host.appendChild(secondTree)
      touchProjectHierarchyTreePreservedScrollTop()
      expect(secondTree.scrollTop).toBe(250)
    }
  })
  expect(secondTree.scrollTop).toBe(250)
})

test('Test that resolveProjectHierarchyTreePreservedScrollTopPx prefers live then drag session then persisted', async () => {
  const { resolveProjectHierarchyTreePreservedScrollTopPx } = await import(
    '../../functions/projectHierarchyTreeScrollPreserveResolve'
  )
  expect(resolveProjectHierarchyTreePreservedScrollTopPx({
    liveScrollTopPx: 40,
    persistedScrollTopPx: 90
  })).toBe(40)
  expect(resolveProjectHierarchyTreePreservedScrollTopPx({
    dragSessionScrollTopPx: 120,
    liveScrollTopPx: 0,
    persistedScrollTopPx: 90
  })).toBe(120)
  expect(resolveProjectHierarchyTreePreservedScrollTopPx({
    liveScrollTopPx: 0,
    persistedScrollTopPx: 90
  })).toBe(90)
  expect(resolveProjectHierarchyTreePreservedScrollTopPx({
    liveScrollTopPx: 0,
    persistedScrollTopPx: 0
  })).toBe(0)
})

test('Test that shouldSkipProjectHierarchyTreeScrollPersistWhileDrag blocks zero during drag', async () => {
  const { shouldSkipProjectHierarchyTreeScrollPersistWhileDrag } = await import(
    '../../functions/projectHierarchyTreeScrollPreserveResolve'
  )
  expect(shouldSkipProjectHierarchyTreeScrollPersistWhileDrag({
    dragCommitPending: true,
    isTreeDragActive: false,
    scrollTopPx: 0
  })).toBe(true)
  expect(shouldSkipProjectHierarchyTreeScrollPersistWhileDrag({
    dragCommitPending: false,
    isTreeDragActive: true,
    scrollTopPx: 0
  })).toBe(true)
  expect(shouldSkipProjectHierarchyTreeScrollPersistWhileDrag({
    dragCommitPending: true,
    isTreeDragActive: true,
    scrollTopPx: 40
  })).toBe(false)
  expect(shouldSkipProjectHierarchyTreeScrollPersistWhileDrag({
    dragCommitPending: false,
    isTreeDragActive: false,
    scrollTopPx: 0
  })).toBe(false)
  expect(shouldSkipProjectHierarchyTreeScrollPersistWhileDrag({
    dragCommitPending: false,
    isTreeDragActive: false,
    scrollPreserveActive: true,
    scrollTopPx: 0
  })).toBe(true)
})

test('Test that applyProjectHierarchyTreeVirtualListDefaults sets VirtualList buffer and itemSize', () => {
  applyProjectHierarchyTreeVirtualListDefaults()
  const props = (VirtualList as {
    props?: {
      buffer?: { default?: number }
      itemSize?: { default?: (item: unknown, index: number) => number }
    }
  }).props
  expect(props?.buffer?.default).toBe(PROJECT_HIERARCHY_TREE_VIRTUAL_LIST_BUFFER_PX)
  expect(props?.itemSize?.default?.(null, 0)).toBe(PROJECT_HIERARCHY_TREE_VIRTUAL_ROW_SIZE_PX)
})

test('Test that requestProjectHierarchyTreeVirtualListUpdate calls vtlist update', () => {
  const update = vi.fn()
  requestProjectHierarchyTreeVirtualListUpdate({
    $refs: {
      vtlist: {
        update
      }
    },
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  })
  expect(update).toHaveBeenCalledOnce()
  requestProjectHierarchyTreeVirtualListUpdate(null)
})

test('Test that applyProjectHierarchyTreeVirtualListDefaults no-ops when VirtualList props missing', () => {
  const virtualList = VirtualList as {
    props?: {
      buffer?: { default?: number }
      itemSize?: { default?: unknown }
    } | undefined
  }
  const originalProps = virtualList.props
  virtualList.props = undefined
  applyProjectHierarchyTreeVirtualListDefaults()
  virtualList.props = {}
  applyProjectHierarchyTreeVirtualListDefaults()
  virtualList.props = originalProps
  applyProjectHierarchyTreeVirtualListDefaults()
  expect(virtualList.props?.buffer?.default).toBe(PROJECT_HIERARCHY_TREE_VIRTUAL_LIST_BUFFER_PX)
})

test('Test that scroll persist flush covers preserve skip, clamp, skip-persist, and pending frame', async () => {
  const {
    attachProjectHierarchyTreeScrollPersist,
    attachProjectHierarchyTreeUiStateScrollListeners
  } = await import('../projectHierarchyTreeScrollPersistListenersWiring')
  const {
    isProjectHierarchyTreeScrollPreserveActive,
    runWithPreservedProjectHierarchyTreeScrollTop
  } = await import('../projectHierarchyTreeScrollPreserveWiring')

  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  Object.defineProperty(tree, 'scrollTop', {
    configurable: true,
    value: 80,
    writable: true
  })
  Object.defineProperty(tree, 'scrollHeight', {
    configurable: true,
    value: 200
  })
  Object.defineProperty(tree, 'clientHeight', {
    configurable: true,
    value: 100
  })
  host.appendChild(tree)
  const queuePersistScrollTopPx = vi.fn()
  const update = vi.fn()
  const getTreeRef = () => ({
    $refs: { vtlist: { update } },
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  })

  const detachSkip = attachProjectHierarchyTreeUiStateScrollListeners({
    getTreeRef,
    getTreeScrollHost: () => host,
    queuePersistScrollTopPx,
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    shouldSkipPersistScrollTopPx: (scrollTopPx) => scrollTopPx === 99
  })
  tree.scrollTop = 99
  tree.dispatchEvent(new Event('scroll'))
  expect(queuePersistScrollTopPx).not.toHaveBeenCalled()
  expect(update).toHaveBeenCalled()
  detachSkip()

  queuePersistScrollTopPx.mockClear()
  update.mockClear()
  const detachClamp = attachProjectHierarchyTreeScrollPersist({
    getTreeRef,
    getTreeScrollHost: () => host,
    queuePersistScrollTopPx,
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    }
  })
  tree.scrollTop = 100
  tree.dispatchEvent(new Event('scroll'))
  expect(update).toHaveBeenCalled()
  expect(queuePersistScrollTopPx).toHaveBeenCalledWith(100)
  detachClamp()

  queuePersistScrollTopPx.mockClear()
  const pendingCallbacks: Array<() => void> = []
  const detachPending = attachProjectHierarchyTreeScrollPersist({
    getTreeRef,
    getTreeScrollHost: () => host,
    queuePersistScrollTopPx,
    requestAnimationFrame: (callback) => {
      pendingCallbacks.push(callback)
      return pendingCallbacks.length
    }
  })
  tree.scrollTop = 55
  tree.dispatchEvent(new Event('scroll'))
  tree.dispatchEvent(new Event('scroll'))
  expect(pendingCallbacks).toHaveLength(1)
  pendingCallbacks[0]!()
  expect(queuePersistScrollTopPx).toHaveBeenCalledWith(55)
  detachPending()

  queuePersistScrollTopPx.mockClear()
  const detachDuringPreserve = attachProjectHierarchyTreeScrollPersist({
    getTreeRef,
    getTreeScrollHost: () => host,
    queuePersistScrollTopPx,
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    }
  })
  await runWithPreservedProjectHierarchyTreeScrollTop({
    getTreeRef,
    getTreeScrollHost: () => host,
    nextTick: async () => undefined,
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    settleFrameCount: 1,
    run: async () => {
      expect(isProjectHierarchyTreeScrollPreserveActive()).toBe(true)
      tree.dispatchEvent(new Event('scroll'))
    }
  })
  expect(queuePersistScrollTopPx).not.toHaveBeenCalled()
  detachDuringPreserve()

  const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
  const detachCancelPending = attachProjectHierarchyTreeScrollPersist({
    getTreeScrollHost: () => host,
    queuePersistScrollTopPx,
    requestAnimationFrame: () => 7
  })
  tree.dispatchEvent(new Event('scroll'))
  detachCancelPending()
  expect(cancelSpy).toHaveBeenCalledWith(7)
  cancelSpy.mockRestore()
})

test('Test that waitForNextAnimationFrame resolves after two frames', async () => {
  const { waitForNextAnimationFrame } = await import('../projectHierarchyTreeHeTreeHelpersWiring')
  let frames = 0
  await waitForNextAnimationFrame((callback) => {
    frames += 1
    callback()
    return frames
  })
  expect(frames).toBe(2)
})

test('Test that handleProjectHierarchyTreeOpenIconClick awaits resync when closing without open icon', async () => {
  const { handleProjectHierarchyTreeOpenIconClick } = await import('../projectHierarchyTreeHeTreeHelpersWiring')
  const awaitHeTreeResyncIdle = vi.fn(async () => undefined)
  const onNodeClose = vi.fn()
  const node = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-1',
    groupId: null,
    hasChildren: false,
    icon: 'mdi-file',
    id: 'doc-1',
    label: 'Leaf',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const stat = {
    children: [],
    open: true
  }
  await handleProjectHierarchyTreeOpenIconClick({
    awaitHeTreeResyncIdle,
    getOpenIconPointerWasOpen: () => null,
    node,
    onNodeClose,
    onNodeOpen: vi.fn(async () => undefined),
    scheduleOpenIconExpandAnimation: vi.fn(),
    setOpenIconPointerWasOpen: vi.fn(),
    stat
  })
  expect(awaitHeTreeResyncIdle).toHaveBeenCalledOnce()
  expect(onNodeClose).toHaveBeenCalledOnce()
  expect(stat.open).toBe(false)
})

test('Test that bindProjectHierarchyTreeSessionHydrateLifecycle restore uses scroll preserve', async () => {
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  let capturedRestore: ((expandedNodeIds: string[]) => Promise<void>) | null = null
  const bootstrapWiring = await import('../projectHierarchyTreeSessionBootstrapWiring')
  const hydrateSpy = vi.spyOn(bootstrapWiring, 'createProjectHierarchyTreeSessionHydrateWiring')
    .mockReturnValue({
      hydrateTreeSession: vi.fn(async () => undefined),
      isTreeSessionHydrateInFlight: () => false,
      teardown: vi.fn()
    })
  const wireSpy = vi.spyOn(bootstrapWiring, 'wireProjectHierarchyTreeSessionLifecycle')
    .mockImplementation((deps) => {
      capturedRestore = deps.restoreExpandedSnapshot
    })
  const { bindProjectHierarchyTreeSessionHydrateLifecycle } = await import(
    '../projectHierarchyTreeSessionLifecycleBindWiring'
  )
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  Object.defineProperty(tree, 'scrollTop', {
    configurable: true,
    value: 15,
    writable: true
  })
  host.appendChild(tree)
  const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(performance.now())
    return 0
  })
  bindProjectHierarchyTreeSessionHydrateLifecycle({
    S_FaActiveProject: () => ({
      activeProject: { id: 'p1' },
      hasActiveProject: true
    }),
    earlyWiring: {
      bootstrap: {
        sessionRefs: {
          dragCommitPending: { value: false },
          dragCommitScheduled: { value: false },
          dragExpandPostCommitGuard: { value: false },
          dragExpandUiFrozen: { value: false },
          openNodeIds: { value: new Set() },
          treeScrollHostRef: { value: host }
        }
      },
      subWiring: {
        dndWiring: {
          getDragExpandedSnapshotNodeIds: () => null,
          onUnmountedCleanup: vi.fn()
        },
        syncWiring: {
          resyncTreeDataFromLayout: vi.fn()
        },
        uiStateWiring: {
          attachScrollPersist: () => () => undefined,
          onUnmountedCleanup: vi.fn(),
          restoreExpandedSnapshot,
          restoreUiStateFromStore: vi.fn(async () => undefined),
          revealPendingPath: vi.fn(async () => undefined)
        }
      }
    } as never,
    getStoreExpandedNodeIds: () => [],
    hierarchyStore: {
      clearPendingRevealPath: vi.fn(),
      flushUiStatePersist: vi.fn(),
      refreshLayout: vi.fn(async () => undefined),
      refreshUiState: vi.fn(async () => undefined),
      resetOnProjectClose: vi.fn()
    },
    layoutRefreshGeneration: { value: 0 } as never,
    nextTick: async () => undefined,
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    pendingRevealPath: { value: [] } as never,
    treeData: { value: [] } as never,
    watch: vi.fn() as never,
    worlds: { value: [] } as never
  })
  expect(capturedRestore).not.toBeNull()
  await capturedRestore!(['world-1'])
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(['world-1'])
  expect(rafSpy).toHaveBeenCalled()
  rafSpy.mockRestore()
  wireSpy.mockRestore()
  hydrateSpy.mockRestore()
})
