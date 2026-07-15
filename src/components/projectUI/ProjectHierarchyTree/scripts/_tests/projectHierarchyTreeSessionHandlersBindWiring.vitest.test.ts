import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { createProjectHierarchyTreeSessionHandlersBindWiring } from '../projectHierarchyTreeSessionHandlersBindWiring'

vi.mock('../projectHierarchyTreeSessionHandlersWiring', () => {
  return {
    createProjectHierarchyTreeSessionHandlersWiring: (deps: {
      queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
    }) => {
      deps.queuePersistExpandedNodeIds(['world-1'])
      return {
        onNodeRowContextMenu: vi.fn()
      }
    }
  }
})

test('createProjectHierarchyTreeSessionHandlersBindWiring forwards queuePersistExpandedNodeIds', () => {
  const queuePersistExpandedNodeIds = vi.fn()
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
          treeMountKey: ref(0),
          treeScrollHostRef: ref(null)
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
        uiStateWiring: {
          markNodeClosed: vi.fn(),
          markNodeOpen: vi.fn(),
          reapplyHeTreeOpenState: vi.fn(),
          reapplyLatentDescendantExpandState: vi.fn(async () => {})
        }
      }
    } as never,
    hierarchyStore: {
      queuePersistExpandedNodeIds
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
