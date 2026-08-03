/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { createProjectHierarchyTreeSessionHandlersBindWiring } from '../projectHierarchyTreeSessionHandlersSupportWiring'

vi.mock('../projectHierarchyTreeSessionHandlersWiring', () => {
  return {
    createProjectHierarchyTreeSessionHandlersWiring: (deps: {
      getPersistedScrollTopPx: () => number
      getTreeScrollHost: () => HTMLElement | null
      queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
      requestAnimationFrame: (callback: () => void) => number
    }) => {
      deps.queuePersistExpandedNodeIds(['world-1'])
      expect(deps.getPersistedScrollTopPx()).toBe(42)
      expect(deps.getTreeScrollHost()).toBeInstanceOf(HTMLElement)
      deps.requestAnimationFrame(() => undefined)
      return {
        onNodeRowContextMenu: vi.fn()
      }
    }
  }
})

test('createProjectHierarchyTreeSessionHandlersBindWiring forwards queuePersistExpandedNodeIds', () => {
  const queuePersistExpandedNodeIds = vi.fn()
  const host = document.createElement('div')
  const wiring = createProjectHierarchyTreeSessionHandlersBindWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    dragContext: {
      dragNode: null
    },
    earlyWiring: {
      bootstrap: {
        documentRowExpandClickGesture: {},
        sessionRefs: {
          dragExpandPostCommitGuard: ref(false),
          dragExpandUiFrozen: ref(false),
          openNodeIds: ref(new Set()),
          suppressTreeEmit: ref(false),
          treeComponentRef: ref(null),
          treeScrollHostRef: ref(host)
        }
      },
      documentRowDragHoldWiring: {},
      subWiring: {
        dndWiring: {
          getDragExpandedSnapshotNodeIds: () => null
        },
        lazyLoadWiring: {
          flushDeferredTreeRevisionPublish: vi.fn(),
          loadChildrenForNode: vi.fn(async () => {})
        },
        openIconExpandAnimationWiring: {
          scheduleOpenIconExpandAnimation: vi.fn()
        },
        runDeferredLazyLoadBatch: vi.fn(async (runBatch: () => Promise<void>) => {
          await runBatch()
        }),
        uiStateWiring: {
          awaitHeTreeResyncIdle: vi.fn(async () => {}),
          isProgrammaticHeTreeResyncActive: () => false,
          markNodeClosed: vi.fn(),
          markNodeOpen: vi.fn(),
          reapplyHeTreeOpenState: vi.fn(),
          reapplyLatentDescendantExpandState: vi.fn(async () => {}),
          resyncHeTreeAfterExpandPublish: vi.fn(async () => {})
        }
      }
    } as never,
    hierarchyStore: {
      queuePersistExpandedNodeIds,
      uiState: { scrollTopPx: 42 }
    },
    nextTick: async () => {},
    onDocumentOpenRequest: vi.fn(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    treeData: ref([])
  })

  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['world-1'])
  expect(wiring.onNodeRowContextMenu).toBeDefined()
})
