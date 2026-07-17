/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeSessionExpandOpenOnNodeOpenHandler } from '../projectHierarchyTreeSessionExpandOpenOnNodeOpenWiring'

function buildPlacementNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: 'group-1',
    hasChildren: true,
    icon: '',
    id: 'placement-1',
    label: 'Buildings',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

test('Test that onNodeOpen awaits in-flight expand for the same node id', async () => {
  const node = buildPlacementNode()
  const loadControl = {
    release: () => undefined as void
  }
  const loadChildrenForNode = vi.fn(() => new Promise<void>((resolve) => {
    loadControl.release = resolve
  }))
  const markNodeOpen = vi.fn()
  const onNodeOpen = createProjectHierarchyTreeSessionExpandOpenOnNodeOpenHandler({
    dragExpandUiFrozen: ref(false),
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(),
      loadChildrenForNode
    },
    openNodeIds: ref(new Set()),
    runDeferredLazyLoadBatch: async (runBatch) => {
      await runBatch()
    },
    suppressTreeEmit: ref(false),
    treeComponentRef: ref(null),
    treeData: ref([node]),
    uiStateWiring: {
      awaitHeTreeResyncIdle: async () => undefined,
      isProgrammaticHeTreeResyncActive: () => false,
      markNodeOpen,
      reapplyLatentDescendantExpandState: async () => undefined,
      resyncHeTreeAfterExpandPublish: async () => undefined
    }
  })
  const first = onNodeOpen({ data: node }, { source: 'openIcon' })
  await vi.waitFor(() => {
    expect(loadChildrenForNode).toHaveBeenCalledTimes(1)
  })
  const second = onNodeOpen({ data: node }, { source: 'openIcon' })
  loadControl.release()
  await Promise.all([first, second])
  expect(markNodeOpen).toHaveBeenCalledTimes(1)
  expect(loadChildrenForNode).toHaveBeenCalledTimes(1)
})
