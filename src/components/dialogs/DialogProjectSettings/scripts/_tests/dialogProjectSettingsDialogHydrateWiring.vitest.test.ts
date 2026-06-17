import { ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import { hydrateDialogProjectSettingsDrafts } from '../dialogProjectSettingsDialogHydrateWiring'

const templateRow = {
  displayName: 'Character',
  documentCount: 0,
  icon: '',
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  worldAppendix: ''
}

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
      displayName: 'Fetched world',
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
    faProjectWorldsFetchFreshForDialog: fetchWorlds
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
  expect(localWorlds.value?.[0]?.displayName).toBe('Fetched world')
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
    faProjectWorldsFetchFreshForDialog: vi.fn(async () => [])
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
