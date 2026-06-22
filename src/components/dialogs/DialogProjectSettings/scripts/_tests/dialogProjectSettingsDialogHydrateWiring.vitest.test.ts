import { ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import { buildDialogProjectSettingsDocumentTemplateDraft } from '../../_tests/dialogProjectSettingsDocumentTemplateDraftFixtures'
import { hydrateDialogProjectSettingsDrafts } from '../dialogProjectSettingsDialogHydrateWiring'

const templateRow = buildDialogProjectSettingsDocumentTemplateDraft()

/**
 * hydrateDialogProjectSettingsDrafts
 * Uses direct snapshots when provided and fetches only missing draft slices.
 */
test('Test that hydrateDialogProjectSettingsDrafts mixes direct snapshots with bridge fetches', async () => {
  const fetchSettings = vi.fn(async () => ({
    projectName: 'Fetched',
    schemaVersion: 1 as const
  }))
  const fetchWorlds = vi.fn(async () => [
    {
      color: '',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Fetched world' },
      documentCount: 0,
      templateLayout: {
        groups: [],
        placements: []
      },
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ])
  const fetchTemplates = vi.fn(async () => [templateRow])

  const localSettings = ref<I_faProjectSettingsRoot | null>(null)
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)

  await hydrateDialogProjectSettingsDrafts({
    faProjectDocumentTemplatesFetchFreshForDialog: fetchTemplates,
    faProjectSettingsFetchFreshForDialog: fetchSettings,
    faProjectWorldsFetchFreshForDialog: fetchWorlds,
    getCurrentLanguageCode: () => 'en-US'
  }, {
    localDocumentTemplates,
    localSettings,
    localWorlds,
    props: {
      directDocumentTemplatesSnapshot: [templateRow]
    }
  })

  expect(fetchSettings).toHaveBeenCalledOnce()
  expect(fetchWorlds).toHaveBeenCalledOnce()
  expect(fetchTemplates).not.toHaveBeenCalled()
  expect(localDocumentTemplates.value).toEqual([templateRow])
  expect(localSettings.value?.projectName).toBe('Fetched')
  expect(localWorlds.value?.[0]?.displayNameTranslations).toEqual({ 'en-US': 'Fetched world' })
})

/**
 * hydrateDialogProjectSettingsDrafts
 * Fetches document templates when no direct templates snapshot is passed.
 */
test('Test that hydrateDialogProjectSettingsDrafts fetches document templates from the bridge', async () => {
  const fetchTemplates = vi.fn(async () => [templateRow])
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)

  await hydrateDialogProjectSettingsDrafts({
    faProjectDocumentTemplatesFetchFreshForDialog: fetchTemplates,
    faProjectSettingsFetchFreshForDialog: vi.fn(async () => ({
      projectName: 'Realm',
      schemaVersion: 1 as const
    })),
    faProjectWorldsFetchFreshForDialog: vi.fn(async () => []),
    getCurrentLanguageCode: () => 'en-US'
  }, {
    localDocumentTemplates,
    localSettings: ref<I_faProjectSettingsRoot | null>(null),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>(null),
    props: {
      directSettingsSnapshot: {
        projectName: 'Direct',
        schemaVersion: 1
      },
      directWorldsSnapshot: []
    }
  })

  expect(fetchTemplates).toHaveBeenCalledOnce()
  expect(localDocumentTemplates.value).toEqual([templateRow])
})

test('Test that hydrateDialogProjectSettingsDrafts localizes world template layout placement labels', async () => {
  const localizedTemplate = buildDialogProjectSettingsDocumentTemplateDraft({
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
  const fetchWorlds = vi.fn(async () => [
    {
      color: '',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Realm' },
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000',
      templateLayout: {
        groups: [],
        placements: [
          {
            documentCountInWorld: 0,
            documentTemplateId: 'template-a',
            groupId: null,
            groupSortOrder: null,
            icon: '',
            id: '880e8400-e29b-41d4-a716-446655440001',
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

  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)

  await hydrateDialogProjectSettingsDrafts({
    faProjectDocumentTemplatesFetchFreshForDialog: vi.fn(async () => [localizedTemplate]),
    faProjectSettingsFetchFreshForDialog: vi.fn(async () => ({
      projectName: 'Realm',
      schemaVersion: 1 as const
    })),
    faProjectWorldsFetchFreshForDialog: fetchWorlds,
    getCurrentLanguageCode: () => 'de'
  }, {
    localDocumentTemplates,
    localSettings: ref<I_faProjectSettingsRoot | null>(null),
    localWorlds,
    props: {}
  })

  expect(localWorlds.value?.[0]?.templateLayout.placements[0]?.templateDisplayName).toBe('Rassen')
  expect(localWorlds.value?.[0]?.templateLayout.placements[0]?.worldAppendix).toBe('yugghm')
})
