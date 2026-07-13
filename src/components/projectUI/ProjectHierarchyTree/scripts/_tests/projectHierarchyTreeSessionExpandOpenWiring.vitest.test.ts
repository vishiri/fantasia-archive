/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { runProjectHierarchyTreeSessionExpandOpen } from '../projectHierarchyTreeSessionExpandOpenWiring'

function buildGroupNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
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
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

function buildAddNewNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: 'group-1',
    hasChildren: false,
    icon: '',
    id: 'add-new-placement-1',
    label: 'Add new',
    nodeKind: 'addNewDocument',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

test('Test that runProjectHierarchyTreeSessionExpandOpen flushes deferred publish before latent reapply on group open', async () => {
  const order: string[] = []
  await runProjectHierarchyTreeSessionExpandOpen({
    flushDeferredTreeRevisionPublish: async () => {
      order.push('flush')
    },
    loadChildrenForNode: async () => {
      order.push('load')
    },
    markNodeOpen: () => {
      order.push('mark')
    },
    node: buildGroupNode(),
    reapplyLatentDescendantExpandState: async () => {
      order.push('reapply')
    },
    treeRef: null
  })
  expect(order).toEqual(['mark', 'load', 'flush', 'reapply'])
})

test('Test that runProjectHierarchyTreeSessionExpandOpen opens he-tree rows when tree ref exists', async () => {
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  const statOpen = {
    open: true
  }
  await runProjectHierarchyTreeSessionExpandOpen({
    loadChildrenForNode: async () => undefined,
    markNodeOpen: vi.fn(),
    node: buildGroupNode(),
    reapplyLatentDescendantExpandState: async () => undefined,
    statOpen,
    treeRef
  })
  expect(treeRef.openNodeAndParents).toHaveBeenCalledTimes(1)
})

test('Test that runProjectHierarchyTreeSessionExpandOpen skips latent reapply for add-new rows', async () => {
  const reapplyLatentDescendantExpandState = vi.fn(async () => undefined)
  await runProjectHierarchyTreeSessionExpandOpen({
    loadChildrenForNode: async () => undefined,
    markNodeOpen: vi.fn(),
    node: buildAddNewNode(),
    reapplyLatentDescendantExpandState,
    treeRef: null
  })
  expect(reapplyLatentDescendantExpandState).not.toHaveBeenCalled()
})
