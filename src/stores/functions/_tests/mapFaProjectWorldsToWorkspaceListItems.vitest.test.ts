import { expect, test } from 'vitest'

import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'

import { mapFaProjectWorldsToWorkspaceListItems } from '../mapFaProjectWorldsToWorkspaceListItems'

const sampleWorlds: I_faProjectWorld[] = [
  {
    color: '#000000',
    colorPallete: '',
    createdAtMs: 1,
    displayName: 'Alpha',
    displayNameTranslations: { 'en-US': 'Alpha' },
    id: 'world-b',
    sortOrder: 1,
    updatedAtMs: 1
  },
  {
    color: '#111111',
    colorPallete: '',
    createdAtMs: 2,
    displayName: 'Beta',
    displayNameTranslations: { 'en-US': 'Beta' },
    id: 'world-a',
    sortOrder: 0,
    updatedAtMs: 2
  }
]

test('Test that mapFaProjectWorldsToWorkspaceListItems preserves input order and resolves display names', () => {
  const items = mapFaProjectWorldsToWorkspaceListItems(sampleWorlds, (world) => world.displayName)

  expect(items).toEqual([
    {
      displayName: 'Alpha',
      id: 'world-b'
    },
    {
      displayName: 'Beta',
      id: 'world-a'
    }
  ])
})

test('Test that mapFaProjectWorldsToWorkspaceListItems returns an empty array for no worlds', () => {
  expect(mapFaProjectWorldsToWorkspaceListItems([], (world) => world.displayName)).toEqual([])
})
