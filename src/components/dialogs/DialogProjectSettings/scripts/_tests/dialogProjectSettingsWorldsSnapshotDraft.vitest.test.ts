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

test('Test that mapDialogProjectSettingsWorldsToSnapshot expands shorthand palette colors', () => {
  expect(mapDialogProjectSettingsWorldsToSnapshot([
    {
      color: '',
      colorPalette: '#112233;#abc',
      displayNameTranslations: { 'en-US': 'Realm' },
      documentCount: 0,
      id: 'world-1',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  ])[0]?.colorPalette).toBe('#112233;#AABBCC')
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
