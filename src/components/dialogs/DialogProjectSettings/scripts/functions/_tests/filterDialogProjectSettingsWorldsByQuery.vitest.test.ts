import { expect, test } from 'vitest'

import { filterDialogProjectSettingsWorldsByQuery } from '../filterDialogProjectSettingsWorldsByQuery'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'

const worldA: I_dialogProjectSettingsWorldDraft = {
  color: '',
  colorPallete: '',
  displayName: 'Gungala',
  documentCount: 0,
  id: 'world-a',
  templateLayout: {
    groups: [],
    placements: []
  }
}

const worldB: I_dialogProjectSettingsWorldDraft = {
  color: '',
  colorPallete: '',
  displayName: 'New world',
  documentCount: 0,
  id: 'world-b',
  templateLayout: {
    groups: [],
    placements: []
  }
}

const worlds = [worldA, worldB]

test('Test that worlds filter returns all rows for blank query', () => {
  expect(filterDialogProjectSettingsWorldsByQuery(worlds, '')).toEqual(worlds)
  expect(filterDialogProjectSettingsWorldsByQuery(worlds, '   ')).toEqual(worlds)
})

test('Test that worlds filter matches display name case-insensitively', () => {
  expect(filterDialogProjectSettingsWorldsByQuery(worlds, 'gung')).toEqual([worldA])
})

test('Test that worlds filter excludes rows without name match', () => {
  expect(filterDialogProjectSettingsWorldsByQuery(worlds, 'missing')).toEqual([])
})
