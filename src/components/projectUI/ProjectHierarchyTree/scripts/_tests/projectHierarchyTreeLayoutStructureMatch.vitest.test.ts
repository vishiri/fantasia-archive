import { expect, test, vi } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { mapWorkspaceLayoutToHierarchyTreeSkeleton } from '../projectHierarchyTreeMapperWiring'
import * as topologyKeyModule from '../../functions/projectHierarchyTreeTopologyKey'
import { projectHierarchyTreeLayoutStructureMatchesTree } from '../projectHierarchyTreeLayoutStructureMatch'

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
      displayName: 'Character',
      documentTemplateId: 'template-1',
      groupId: 'group-1',
      groupSortOrder: 0,
      hasChildren: true,
      icon: 'mdi-account',
      titlePluralTranslations: {},
      titleSingularTranslations: {},
      id: 'placement-1',
      nickname: 'Heroes',
      rootSortOrder: null,
      worldId: 'world-1'
    }
  ],
  sortOrder: 0
}

/**
 * projectHierarchyTreeLayoutStructureMatchesTree skips non-world root nodes when comparing counts.
 */
test('Test that projectHierarchyTreeLayoutStructureMatchesTree skips non-world root nodes', () => {
  const topologySpy = vi
    .spyOn(topologyKeyModule, 'mapProjectHierarchyTreeToTopologyKey')
    .mockReturnValue('topology-key')
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const strayRoot: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-1',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-root',
    label: 'Stray',
    nodeKind: 'document',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
  tree.push(strayRoot)
  expect(projectHierarchyTreeLayoutStructureMatchesTree(tree, [sampleWorld])).toBe(true)
  topologySpy.mockRestore()
})

/**
 * projectHierarchyTreeLayoutStructureMatchesTree rejects world nodes missing from layout worlds.
 */
test('Test that projectHierarchyTreeLayoutStructureMatchesTree rejects missing layout worlds', () => {
  const topologySpy = vi
    .spyOn(topologyKeyModule, 'mapProjectHierarchyTreeToTopologyKey')
    .mockReturnValue('topology-key')
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  tree[0]!.id = 'missing-world'
  expect(projectHierarchyTreeLayoutStructureMatchesTree(tree, [sampleWorld])).toBe(false)
  topologySpy.mockRestore()
})

/**
 * projectHierarchyTreeLayoutStructureMatchesTree rejects mismatched structural child counts.
 */
test('Test that projectHierarchyTreeLayoutStructureMatchesTree rejects structural child count mismatch', () => {
  const topologySpy = vi
    .spyOn(topologyKeyModule, 'mapProjectHierarchyTreeToTopologyKey')
    .mockReturnValue('topology-key')
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  tree[0]!.children = []
  expect(projectHierarchyTreeLayoutStructureMatchesTree(tree, [sampleWorld])).toBe(false)
  topologySpy.mockRestore()
})
