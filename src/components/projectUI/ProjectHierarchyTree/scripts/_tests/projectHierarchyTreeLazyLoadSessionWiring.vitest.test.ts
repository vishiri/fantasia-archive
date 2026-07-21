/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref, watch } from 'vue'

import { mapWorkspaceLayoutToHierarchyTreeSkeleton } from '../projectHierarchyTreeMapperWiring'
import { findProjectHierarchyTreeNodeById } from '../../functions/projectHierarchyTreeExpandState'
import { createProjectHierarchyTreeLazyLoadSessionWiring } from '../projectHierarchyTreeLazyLoadSessionWiring'

const sampleWorld = {
  color: '#ff0000',
  colorPallete: '',
  displayName: 'World A',
  groups: [
    {
      displayName: 'Group 1',
      hasChildren: true,
      id: 'group-1',
      rootSortOrder: 0,
      worldId: 'world-1'
    }
  ],
  id: 'world-1',
  placements: [
    {
      displayName: 'Buildings',
      documentTemplateId: 'template-1',
      groupId: 'group-1',
      groupSortOrder: 0,
      hasChildren: true,
      icon: 'mdi-home',
      id: 'placement-1',
      nickname: '',
      titlePluralTranslations: {},
      titleSingularTranslations: {},
      rootSortOrder: null,
      worldId: 'world-1'
    }
  ],
  sortOrder: 0
}

test('Test that lazy load session skips reapply while deferred publish flag is set', async () => {
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: [{
      displayName: 'Doc A',
      hasChildren: false,
      id: 'doc-a',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 0
    }]
  }))
  window.faContentBridgeAPIs = {
    projectContent: {
      listPlacementDocumentChildren
    }
  } as never
  const deferLazyLoadTreeRevisionPublish = ref(false)
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const wiring = createProjectHierarchyTreeLazyLoadSessionWiring({
    deferLazyLoadTreeRevisionPublish,
    dragExpandUiFrozen: ref(false),
    flushUiStatePersist: vi.fn(),
    getExpandedNodeIds: () => [],
    getForceSublevelCollapseInTree: () => false,
    getPendingRevealPath: () => [],
    getPreferredLanguageCode: () => 'en-US',
    getScrollTopPx: () => 0,
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    getWorlds: () => [sampleWorld],
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn()
    },
    nextTick: async () => undefined,
    openNodeIds: ref(new Set()),
    pendingRevealPath: ref([]),
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    suppressTreeEmit: ref(false),
    treeData,
    treeMountKey: ref(0),
    watch
  })
  const reapplySpy = vi.spyOn(wiring.uiStateWiring, 'reapplyHeTreeOpenState')
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  await wiring.runDeferredLazyLoadBatch(async () => {
    await wiring.lazyLoadWiring.loadChildrenForNode(placement)
  }, {
    skipReapplyHeTreeOpenState: true
  })
  expect(listPlacementDocumentChildren).toHaveBeenCalled()
  expect(reapplySpy).not.toHaveBeenCalled()
})
