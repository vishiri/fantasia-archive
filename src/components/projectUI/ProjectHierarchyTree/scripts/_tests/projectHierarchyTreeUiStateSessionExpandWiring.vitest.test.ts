/** @vitest-environment jsdom */
import { ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeUiStateSessionExpandWiring } from '../projectHierarchyTreeUiStateSessionExpandWiring'

const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentId: null,
  documentTemplateId: 'template-1',
  groupId: 'group-1',
  hasChildren: true,
  icon: 'mdi-account',
  id: 'placement-1',
  label: 'Characters',
  nodeKind: 'templatePlacement',
  placementId: 'placement-1',
  worldColor: '#000',
  worldId: 'world-1'
}

test('Test that createProjectHierarchyTreeUiStateSessionExpandWiring closes with force sublevel collapse', () => {
  const closeAll = vi.fn()
  const suppressTreeEmit = ref(false)
  const openNodeIds = ref(new Set(['world-1', 'placement-1']))
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([
    {
      children: [placementNode],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: 'mdi-earth',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      worldColor: '#000',
      worldId: 'world-1'
    }
  ])

  const wiring = createProjectHierarchyTreeUiStateSessionExpandWiring({
    commitStagedLoadedChildren: () => false,
    flushDeferredTreeRevisionPublish: async () => undefined,
    getForceSublevelCollapseInTree: () => true,
    getTreeRef: () => ({
      closeAll,
      openNodeAndParents: vi.fn()
    }) as never,
    loadChildrenAlongRevealPath: async () => undefined,
    nextTick: async () => undefined,
    openNodeIds,
    queuePersistExpandedNodeIds: vi.fn(),
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    suppressTreeEmit,
    treeData,
    treeMountKey: ref(0)
  })

  wiring.markNodeClosed('placement-1', placementNode)

  expect(closeAll).toHaveBeenCalled()
  expect(suppressTreeEmit.value).toBe(false)
})

test('Test that createProjectHierarchyTreeUiStateSessionExpandWiring marks nodes open', () => {
  const openNodeIds = ref(new Set<string>())
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([])
  const queuePersistExpandedNodeIds = vi.fn()

  const wiring = createProjectHierarchyTreeUiStateSessionExpandWiring({
    commitStagedLoadedChildren: () => false,
    flushDeferredTreeRevisionPublish: async () => undefined,
    getForceSublevelCollapseInTree: () => false,
    getTreeRef: () => null,
    loadChildrenAlongRevealPath: async () => undefined,
    nextTick: async () => undefined,
    openNodeIds,
    queuePersistExpandedNodeIds,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    suppressTreeEmit: ref(false),
    treeData,
    treeMountKey: ref(0)
  })

  wiring.markNodeOpen('world-1')

  expect(openNodeIds.value.has('world-1')).toBe(true)
  expect(queuePersistExpandedNodeIds).toHaveBeenCalled()
})
