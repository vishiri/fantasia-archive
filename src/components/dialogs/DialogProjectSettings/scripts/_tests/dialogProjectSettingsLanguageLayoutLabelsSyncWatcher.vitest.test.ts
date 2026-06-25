import { ref } from 'vue'
import { expect, test } from 'vitest'

import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { buildDialogProjectSettingsDocumentTemplateDraft } from '../../_tests/dialogProjectSettingsDocumentTemplateDraftFixtures'
import { registerDialogProjectSettingsLanguageLayoutLabelsSyncWatcher } from '../dialogProjectSettingsLanguageLayoutLabelsSyncWatcher'

test('Test that registerDialogProjectSettingsLanguageLayoutLabelsSyncWatcher resyncs placement labels on language change', () => {
  const template = buildDialogProjectSettingsDocumentTemplateDraft({
    id: 'template-a',
    titlePluralTranslations: {
      de: 'Rassen',
      'en-US': 'Races'
    },
    worldAppendixTranslations: {
      de: 'yugghm',
      'en-US': 'notes'
    }
  })
  const localDocumentTemplates = ref([template])
  const localWorlds = ref([
    {
      color: '',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Realm' },
      documentCount: 0,
      id: 'world-a',
      templateLayout: {
        groups: [],
        placements: [
          {
            documentCountInWorld: 0,
            documentTemplateId: 'template-a',
            groupId: null,
            groupSortOrder: null,
            icon: '',
            id: 'placement-a',
            nicknamePluralTranslations: {},
            nicknameSingularTranslations: {},
            rootSortOrder: 0,
            templateDisplayName: 'Races',
            worldAppendix: 'notes'
          }
        ]
      }
    }
  ])
  let languageCode: T_faUserSettingsLanguageCode = 'en-US'
  let watchEffect: (() => void) | undefined

  registerDialogProjectSettingsLanguageLayoutLabelsSyncWatcher({
    getCurrentLanguageCode: () => languageCode,
    localDocumentTemplates,
    localWorlds,
    watch: (_source, effect) => {
      watchEffect = effect
    }
  })

  expect(watchEffect).toBeTypeOf('function')
  languageCode = 'de'
  watchEffect!()

  expect(localWorlds.value?.[0]!?.templateLayout.placements[0]!?.templateDisplayName).toBe('Rassen')
  expect(localWorlds.value?.[0]!?.templateLayout.placements[0]!?.worldAppendix).toBe('yugghm')
})

test('Test that registerDialogProjectSettingsLanguageLayoutLabelsSyncWatcher no-ops when drafts are null', () => {
  const localDocumentTemplates = ref(null)
  const localWorlds = ref(null)
  let watchEffect: (() => void) | undefined

  registerDialogProjectSettingsLanguageLayoutLabelsSyncWatcher({
    getCurrentLanguageCode: () => 'de',
    localDocumentTemplates,
    localWorlds,
    watch: (_source, effect) => {
      watchEffect = effect
    }
  })

  watchEffect!()
  expect(localWorlds.value).toBeNull()
})
