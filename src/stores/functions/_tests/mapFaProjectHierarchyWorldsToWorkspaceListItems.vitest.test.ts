import { expect, test } from 'vitest'

import { mapFaProjectHierarchyWorldsToWorkspaceListItems } from '../mapFaProjectHierarchyWorldsToWorkspaceListItems'

const sampleWorlds = [
  {
    displayName: 'Second',
    id: 'world-2'
  },
  {
    displayName: 'First',
    id: 'world-1'
  }
]

/**
 * mapFaProjectHierarchyWorldsToWorkspaceListItems
 * Preserves hierarchy layout order and copies displayName/id onto sidebar rows.
 */
test('Test that mapFaProjectHierarchyWorldsToWorkspaceListItems preserves input order and display names', () => {
  const items = mapFaProjectHierarchyWorldsToWorkspaceListItems(sampleWorlds)

  expect(items).toEqual([
    {
      displayName: 'Second',
      id: 'world-2'
    },
    {
      displayName: 'First',
      id: 'world-1'
    }
  ])
})

/**
 * mapFaProjectHierarchyWorldsToWorkspaceListItems
 * Empty hierarchy worlds yield an empty sidebar list.
 */
test('Test that mapFaProjectHierarchyWorldsToWorkspaceListItems returns an empty array for no worlds', () => {
  expect(mapFaProjectHierarchyWorldsToWorkspaceListItems([])).toEqual([])
})
