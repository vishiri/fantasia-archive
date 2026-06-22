import { expect, test } from 'vitest'

import { mapDialogProjectSettingsWorldsToSnapshot } from '../dialogProjectSettingsWorldsSnapshotDraft'

test('Test that mapDialogProjectSettingsWorldsToSnapshot normalizes display name translations', () => {
  expect(mapDialogProjectSettingsWorldsToSnapshot([
    {
      color: '',
      colorPallete: '',
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
      displayNameTranslations: { 'en-US': 'Realm' },
      id: 'world-1',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  ])
})
