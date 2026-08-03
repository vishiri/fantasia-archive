/** @vitest-environment jsdom */
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'

const sampleHierarchyWorlds: I_faProjectHierarchyTreeWorkspaceWorld[] = [
  {
    color: '#000000',
    colorPalette: '',
    displayName: 'Second World',
    groups: [],
    id: 'world-2',
    placements: [],
    sortOrder: 1
  },
  {
    color: '#111111',
    colorPalette: '',
    displayName: 'First World',
    groups: [],
    id: 'world-1',
    placements: [],
    sortOrder: 0
  }
]

beforeEach(() => {
  setActivePinia(createPinia())
  S_FaActiveProject().clearActiveProject()
})

test('Test that refreshWorkspaceWorlds clears the list when no project is active', async () => {
  const { S_FaProjectWorkspaceWorlds } = await import('../S_FaProjectWorkspaceWorlds')
  S_FaProjectHierarchyTree().replaceSessionForComponentTesting({
    worlds: sampleHierarchyWorlds
  })
  const store = S_FaProjectWorkspaceWorlds()

  await store.refreshWorkspaceWorlds()

  expect(store.worldListItems).toEqual([])
})

test('Test that worldListItems derive from hierarchy tree worlds', async () => {
  const { S_FaProjectWorkspaceWorlds } = await import('../S_FaProjectWorkspaceWorlds')
  S_FaProjectHierarchyTree().replaceSessionForComponentTesting({
    worlds: sampleHierarchyWorlds
  })

  const store = S_FaProjectWorkspaceWorlds()

  expect(store.worldListItems).toEqual([
    {
      displayName: 'Second World',
      id: 'world-2'
    },
    {
      displayName: 'First World',
      id: 'world-1'
    }
  ])
})

test('Test that refreshWorkspaceWorlds refreshes hierarchy layout then remaps', async () => {
  const { S_FaProjectWorkspaceWorlds } = await import('../S_FaProjectWorkspaceWorlds')
  const refreshLayout = vi.spyOn(S_FaProjectHierarchyTree(), 'refreshLayout').mockResolvedValue()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  S_FaProjectHierarchyTree().replaceSessionForComponentTesting({
    worlds: sampleHierarchyWorlds
  })

  const store = S_FaProjectWorkspaceWorlds()
  await store.refreshWorkspaceWorlds()

  expect(refreshLayout).toHaveBeenCalledTimes(1)
  expect(store.worldListItems).toEqual([
    {
      displayName: 'Second World',
      id: 'world-2'
    },
    {
      displayName: 'First World',
      id: 'world-1'
    }
  ])
  refreshLayout.mockRestore()
})

test('Test that replaceSessionForComponentTesting seeds hierarchy worlds and remaps', async () => {
  const { S_FaProjectWorkspaceWorlds } = await import('../S_FaProjectWorkspaceWorlds')
  const store = S_FaProjectWorkspaceWorlds()

  store.replaceSessionForComponentTesting([
    {
      color: '#000000',
      colorPalette: '',
      displayName: 'Alpha World',
      groups: [],
      id: 'world-a',
      placements: [],
      sortOrder: 0
    },
    {
      color: '#111111',
      colorPalette: '',
      displayName: 'Beta World',
      groups: [],
      id: 'world-b',
      placements: [],
      sortOrder: 1
    }
  ])

  expect(S_FaProjectHierarchyTree().worlds.map((world) => world.id)).toEqual([
    'world-a',
    'world-b'
  ])
  expect(store.worldListItems).toEqual([
    {
      displayName: 'Alpha World',
      id: 'world-a'
    },
    {
      displayName: 'Beta World',
      id: 'world-b'
    }
  ])
})
