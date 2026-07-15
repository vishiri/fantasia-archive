import { expect, test, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { buildProjectHierarchyTreeNodeContextMenuCopyHandlers } from '../projectHierarchyTreeNodeContextMenuCopyWiring'

vi.mock('../projectHierarchyTreeDocumentNodeLookup', () => ({
  resolveHierarchyTreeDocumentNodeFromAnchor: vi.fn()
}))

import { resolveHierarchyTreeDocumentNodeFromAnchor } from '../projectHierarchyTreeDocumentNodeLookup'

const mockedResolveHierarchyTreeDocumentNodeFromAnchor = vi.mocked(
  resolveHierarchyTreeDocumentNodeFromAnchor
)

beforeEach(async () => {
  const actual = await vi.importActual<typeof import('../projectHierarchyTreeDocumentNodeLookup')>(
    '../projectHierarchyTreeDocumentNodeLookup'
  )
  mockedResolveHierarchyTreeDocumentNodeFromAnchor.mockImplementation(
    actual.resolveHierarchyTreeDocumentNodeFromAnchor
  )
})

const documentNode: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentBackgroundColor: ' #112233 ',
  documentId: 'doc-a',
  documentTextColor: ' #AABBCC ',
  groupId: 'group-1',
  hasChildren: false,
  icon: '',
  id: 'doc-a',
  label: ' One ',
  nodeKind: 'document',
  placementId: 'placement-1',
  worldColor: '#000',
  worldId: 'world-1'
}

test('Test that buildProjectHierarchyTreeNodeContextMenuCopyHandlers dispatches name copy through runFaAction', () => {
  const runFaAction = vi.fn()
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([documentNode])
  const contextMenuAnchorNodeId = ref<string | null>('doc-a')
  const handlers = buildProjectHierarchyTreeNodeContextMenuCopyHandlers({
    contextMenuAnchorNodeId,
    runFaAction,
    treeData
  })

  handlers.onCopyNameClick()

  expect(runFaAction).toHaveBeenCalledWith('copyHierarchyTreeDocumentName', { documentId: 'doc-a' })
})

test('Test that buildProjectHierarchyTreeNodeContextMenuCopyHandlers dispatches text color copy through runFaAction', () => {
  const runFaAction = vi.fn()
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([documentNode])
  const contextMenuAnchorNodeId = ref<string | null>('doc-a')
  const handlers = buildProjectHierarchyTreeNodeContextMenuCopyHandlers({
    contextMenuAnchorNodeId,
    runFaAction,
    treeData
  })

  handlers.onCopyTextColorClick()

  expect(runFaAction).toHaveBeenCalledWith('copyHierarchyTreeDocumentTextColor', { documentId: 'doc-a' })
})

test('Test that buildProjectHierarchyTreeNodeContextMenuCopyHandlers dispatches background color copy through runFaAction', () => {
  const runFaAction = vi.fn()
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([documentNode])
  const contextMenuAnchorNodeId = ref<string | null>('doc-a')
  const handlers = buildProjectHierarchyTreeNodeContextMenuCopyHandlers({
    contextMenuAnchorNodeId,
    runFaAction,
    treeData
  })

  handlers.onCopyBackgroundColorClick()

  expect(runFaAction).toHaveBeenCalledWith(
    'copyHierarchyTreeDocumentBackgroundColor',
    { documentId: 'doc-a' }
  )
})

test('Test that buildProjectHierarchyTreeNodeContextMenuCopyHandlers no-ops when anchor or values are empty', () => {
  const runFaAction = vi.fn()
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([documentNode])
  const contextMenuAnchorNodeId = ref<string | null>(null)
  const handlers = buildProjectHierarchyTreeNodeContextMenuCopyHandlers({
    contextMenuAnchorNodeId,
    runFaAction,
    treeData
  })

  handlers.onCopyNameClick()
  handlers.onCopyTextColorClick()
  handlers.onCopyBackgroundColorClick()

  contextMenuAnchorNodeId.value = 'doc-a'
  treeData.value = [{
    ...documentNode,
    documentBackgroundColor: '   ',
    documentTextColor: '   ',
    label: '   '
  }]
  handlers.onCopyNameClick()
  handlers.onCopyTextColorClick()
  handlers.onCopyBackgroundColorClick()

  expect(runFaAction).not.toHaveBeenCalled()
})

test('Test that buildProjectHierarchyTreeNodeContextMenuCopyHandlers no-ops for non-document anchors', () => {
  const runFaAction = vi.fn()
  const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'placement-1',
    label: 'Buildings',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const handlers = buildProjectHierarchyTreeNodeContextMenuCopyHandlers({
    contextMenuAnchorNodeId: ref('placement-1'),
    runFaAction,
    treeData: ref([placementNode])
  })

  handlers.onCopyNameClick()
  handlers.onCopyTextColorClick()
  handlers.onCopyBackgroundColorClick()

  expect(runFaAction).not.toHaveBeenCalled()
})

test('Test that buildProjectHierarchyTreeNodeContextMenuCopyHandlers no-ops when document id is missing on node', () => {
  const runFaAction = vi.fn()
  mockedResolveHierarchyTreeDocumentNodeFromAnchor.mockReturnValue({
    ...documentNode,
    documentId: null
  })
  const handlers = buildProjectHierarchyTreeNodeContextMenuCopyHandlers({
    contextMenuAnchorNodeId: ref('doc-a'),
    runFaAction,
    treeData: ref([documentNode])
  })

  handlers.onCopyNameClick()
  handlers.onCopyTextColorClick()
  handlers.onCopyBackgroundColorClick()

  expect(runFaAction).not.toHaveBeenCalled()
})
