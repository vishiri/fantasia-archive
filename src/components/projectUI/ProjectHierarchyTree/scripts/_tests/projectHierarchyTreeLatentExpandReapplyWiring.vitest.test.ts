/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { mapWorkspaceLayoutToHierarchyTreeSkeleton } from '../../functions/mapWorkspaceLayoutToHierarchyTreeSkeleton'
import { findProjectHierarchyTreeNodeById } from '../../functions/projectHierarchyTreeExpandState'
import { reapplyProjectHierarchyTreeLatentDescendantExpandState } from '../projectHierarchyTreeLatentExpandReapplyWiring'

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

test('Test that reapplyProjectHierarchyTreeLatentDescendantExpandState stalls when lazy load makes no progress', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set(['world-1', 'group-1', 'placement-1']))
  const loadChildrenAlongRevealPath = vi.fn(async () => undefined)
  await reapplyProjectHierarchyTreeLatentDescendantExpandState({
    getTreeRef: () => null,
    loadChildrenAlongRevealPath,
    openNodeIds,
    treeData
  })
  expect(loadChildrenAlongRevealPath.mock.calls.length).toBeLessThan(20)
})

test('Test that reapplyProjectHierarchyTreeLatentDescendantExpandState opens rows on he-tree ref', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set(['world-1', 'group-1']))
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  placement.childrenLoaded = true
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  const loadChildrenAlongRevealPath = vi.fn(async () => undefined)
  await reapplyProjectHierarchyTreeLatentDescendantExpandState({
    getTreeRef: () => treeRef,
    loadChildrenAlongRevealPath,
    openNodeIds,
    treeData
  })
  expect(treeRef.openNodeAndParents).toHaveBeenCalled()
})

test('Test that reapplyProjectHierarchyTreeLatentDescendantExpandState loads shallow-first sibling ids in stable order', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  placement.children = [
    {
      children: [],
      childrenLoaded: true,
      documentId: 'doc-b',
      groupId: 'group-1',
      hasChildren: true,
      icon: '',
      id: 'doc-b',
      label: 'Doc B',
      nodeKind: 'document',
      placementId: 'placement-1',
      worldColor: '#ff0000',
      worldId: 'world-1'
    },
    {
      children: [],
      childrenLoaded: true,
      documentId: 'doc-a',
      groupId: 'group-1',
      hasChildren: true,
      icon: '',
      id: 'doc-a',
      label: 'Doc A',
      nodeKind: 'document',
      placementId: 'placement-1',
      worldColor: '#ff0000',
      worldId: 'world-1'
    }
  ]
  placement.childrenLoaded = true
  placement.children[0]!.children = []
  placement.children[0]!.childrenLoaded = false
  placement.children[1]!.children = []
  placement.children[1]!.childrenLoaded = false
  const openNodeIds = ref(new Set([
    'world-1',
    'group-1',
    'placement-1',
    'doc-a',
    'doc-b'
  ]))
  const revealPaths: string[][] = []
  const loadChildrenAlongRevealPath = vi.fn(async (nodeIds: string[]) => {
    revealPaths.push([...nodeIds])
  })
  await reapplyProjectHierarchyTreeLatentDescendantExpandState({
    getTreeRef: () => null,
    loadChildrenAlongRevealPath,
    openNodeIds,
    treeData
  })
  const shallowFirstAncestorLoads = revealPaths.filter((path) => {
    return path.length === 4 && (path[3] === 'doc-a' || path[3] === 'doc-b')
  })
  const docAIndex = shallowFirstAncestorLoads.findIndex((path) => path[3] === 'doc-a')
  const docBIndex = shallowFirstAncestorLoads.findIndex((path) => path[3] === 'doc-b')
  expect(docAIndex).toBeGreaterThanOrEqual(0)
  expect(docBIndex).toBeGreaterThan(docAIndex)
})
