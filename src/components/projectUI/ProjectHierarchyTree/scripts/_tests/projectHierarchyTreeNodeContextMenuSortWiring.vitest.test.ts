import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faProjectHierarchyTreeSortByMenuItemId } from 'app/types/I_faProjectHierarchyTreeDomain'

import { buildProjectHierarchyTreeNodeContextMenuSortHandlers } from '../projectHierarchyTreeNodeContextMenuSortWiring'

function documentNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-1',
    groupId: 'group-1',
    hasChildren: true,
    icon: '',
    id: 'doc-1',
    label: 'Doc',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
}

test('buildProjectHierarchyTreeNodeContextMenuSortHandlers dispatches document sort action', () => {
  const runFaAction = vi.fn()
  const isNodeContextMenuOpen = ref(true)
  const handlers = buildProjectHierarchyTreeNodeContextMenuSortHandlers({
    contextMenuAnchorNodeId: ref('doc-1'),
    isNodeContextMenuOpen,
    runFaAction,
    treeData: ref([documentNode()])
  })

  handlers.onSortByItemClick('namesDirectAsc')

  expect(runFaAction).toHaveBeenCalledWith('sortHierarchyTreeDocuments', {
    direction: 'asc',
    documentId: 'doc-1',
    key: 'name',
    nodeKind: 'document',
    placementId: 'placement-1',
    scope: 'direct'
  })
  expect(isNodeContextMenuOpen.value).toBe(false)
})

test('buildProjectHierarchyTreeNodeContextMenuSortHandlers dispatches placement sort action', () => {
  const runFaAction = vi.fn()
  const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: 'group-1',
    hasChildren: true,
    icon: '',
    id: 'placement-1',
    label: 'Type',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const handlers = buildProjectHierarchyTreeNodeContextMenuSortHandlers({
    contextMenuAnchorNodeId: ref('placement-1'),
    isNodeContextMenuOpen: ref(true),
    runFaAction,
    treeData: ref([placementNode])
  })

  handlers.onSortByItemClick('customOrderRecursiveDesc')

  expect(runFaAction).toHaveBeenCalledWith('sortHierarchyTreeDocuments', {
    direction: 'desc',
    documentId: null,
    key: 'customOrder',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    scope: 'recursive'
  })
})

test('buildProjectHierarchyTreeNodeContextMenuSortHandlers no-ops for invalid anchors', () => {
  const runFaAction = vi.fn()
  const isNodeContextMenuOpen = ref(true)
  const handlers = buildProjectHierarchyTreeNodeContextMenuSortHandlers({
    contextMenuAnchorNodeId: ref(null),
    isNodeContextMenuOpen,
    runFaAction,
    treeData: ref([documentNode()])
  })

  handlers.onSortByItemClick('namesDirectAsc')
  expect(runFaAction).not.toHaveBeenCalled()

  handlers.onSortByItemClick('not-a-real-sort' as T_faProjectHierarchyTreeSortByMenuItemId)
  expect(runFaAction).not.toHaveBeenCalled()

  const missingAnchorHandlers = buildProjectHierarchyTreeNodeContextMenuSortHandlers({
    contextMenuAnchorNodeId: ref('missing'),
    isNodeContextMenuOpen,
    runFaAction,
    treeData: ref([documentNode()])
  })
  missingAnchorHandlers.onSortByItemClick('namesDirectAsc')
  expect(runFaAction).not.toHaveBeenCalled()

  const worldNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
  const worldHandlers = buildProjectHierarchyTreeNodeContextMenuSortHandlers({
    contextMenuAnchorNodeId: ref('world-1'),
    isNodeContextMenuOpen,
    runFaAction,
    treeData: ref([worldNode])
  })
  worldHandlers.onSortByItemClick('namesDirectAsc')
  expect(runFaAction).not.toHaveBeenCalled()
  expect(isNodeContextMenuOpen.value).toBe(true)
})
