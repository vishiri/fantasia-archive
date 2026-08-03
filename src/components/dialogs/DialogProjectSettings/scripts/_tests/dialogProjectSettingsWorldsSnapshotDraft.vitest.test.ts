import { expect, test } from 'vitest'

import { mapDialogProjectSettingsWorldsToSnapshot } from '../dialogProjectSettingsWorldsSnapshotDraft'

test('Test that mapDialogProjectSettingsWorldsToSnapshot normalizes display name translations', () => {
  expect(mapDialogProjectSettingsWorldsToSnapshot([
    {
      color: '',
      colorPalette: '',
      displayNameTranslations: { 'en-US': '  Realm  ' },
      documentCount: 0,
      id: 'world-1',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  ])).toEqual([
    {
      color: '',
      displayNameTranslations: { 'en-US': 'Realm' },
      id: 'world-1',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  ])
})

test('Test that mapDialogProjectSettingsWorldsToSnapshot keeps cleared world color empty', () => {
  expect(mapDialogProjectSettingsWorldsToSnapshot([
    {
      color: '   ',
      colorPalette: '',
      displayNameTranslations: { 'en-US': 'Realm' },
      documentCount: 0,
      id: 'world-1',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  ])[0]?.color).toBe('')
})

test('Test that mapDialogProjectSettingsWorldsToSnapshot keeps trimmed world color', () => {
  expect(mapDialogProjectSettingsWorldsToSnapshot([
    {
      color: '  #aabbcc  ',
      colorPalette: '',
      displayNameTranslations: { 'en-US': 'Realm' },
      documentCount: 0,
      id: 'world-1',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  ])[0]?.color).toBe('#aabbcc')
})
