import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeLazyPlaceholderApi } from '../projectHierarchyTreeLazyPlaceholder'
import { collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh } from '../projectHierarchyTreeLoadedTagNodeIds'
import { mapProjectHierarchyTreeTagToNode } from '../projectHierarchyTreeTagNodes'
import { patchProjectHierarchyTreeTagBranchLabelsInPlace } from '../../scripts/projectHierarchyTreeTagBranchPatchWiring'

const lazyPlaceholderApi = createProjectHierarchyTreeLazyPlaceholderApi()

function buildWorldNode (
  children: I_faProjectHierarchyTreeHeTreeNode[]
): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children,
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: children.length > 0,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }
}

/**
 * patchProjectHierarchyTreeTagBranchLabelsInPlace inserts new tag rows without dropping placements.
 */
test('Test that patchProjectHierarchyTreeTagBranchLabelsInPlace adds new tag rows in place', () => {
  const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: 'mdi-file',
    id: 'placement-1',
    label: 'Docs',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }
  const worldNode = buildWorldNode([placementNode])
  patchProjectHierarchyTreeTagBranchLabelsInPlace({
    lazyPlaceholderApi,
    resolveTagsLabel: () => 'Tags',
    tagSettings: {
      compactTags: false,
      noTags: false,
      tagsAtTop: true
    },
    world: {
      color: '#111',
      colorPalette: '',
      displayName: 'World',
      groups: [],
      id: 'world-1',
      placements: [],
      sortOrder: 0,
      tags: [{
        categoryCount: 0,
        documentCount: 1,
        id: 'tag-new',
        name: 'Doom Tag'
      }]
    },
    worldNode
  })
  expect(worldNode.children.map((child) => child.id)).toEqual(['tag-new', 'placement-1'])
  expect(worldNode.children[0]?.nodeKind).toBe('tag')
  expect(worldNode.children[0]?.documentCount).toBe(1)
})

/**
 * collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh only returns expanded loaded tags.
 */
test('Test that collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh skips unloaded tags', () => {
  const loadedTag = mapProjectHierarchyTreeTagToNode({
    lazyPlaceholderApi,
    tag: {
      categoryCount: 0,
      documentCount: 2,
      id: 'tag-1',
      name: 'Loaded'
    },
    world: {
      color: '#111',
      id: 'world-1'
    }
  })
  loadedTag.childrenLoaded = true
  loadedTag.children = []
  const unloadedTag = mapProjectHierarchyTreeTagToNode({
    lazyPlaceholderApi,
    tag: {
      categoryCount: 0,
      documentCount: 1,
      id: 'tag-2',
      name: 'Unloaded'
    },
    world: {
      color: '#111',
      id: 'world-1'
    }
  })
  const tree = [buildWorldNode([loadedTag, unloadedTag])]
  expect(collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh(tree, ['tag-1', 'tag-2', 'tag-3']))
    .toEqual(['tag-1'])
  expect(collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh(tree, [])).toEqual([])
  expect(collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh(
    tree,
    ['tag-1', 'tag-2'],
    ['tag-2']
  )).toEqual(['tag-1', 'tag-2'])
})
