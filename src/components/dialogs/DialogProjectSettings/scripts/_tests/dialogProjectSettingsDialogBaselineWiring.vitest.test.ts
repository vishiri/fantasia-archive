import { ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import { captureDialogProjectSettingsBaselines } from '../dialogProjectSettingsDialogBaselineWiring'

/**
 * captureDialogProjectSettingsBaselines
 * Clones current drafts so later edits can detect dirty state.
 */
test('Test that captureDialogProjectSettingsBaselines clones drafts independently', () => {
  const localSettings = ref<I_faProjectSettingsRoot | null>({
    projectName: 'Realm',
    schemaVersion: 1
  })
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([])
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([])
  const baselineSettings = ref<I_faProjectSettingsRoot | null>(null)
  const baselineWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  const baselineDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)

  captureDialogProjectSettingsBaselines({
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    localDocumentTemplates,
    localSettings,
    localWorlds
  })

  expect(baselineSettings.value).toEqual(localSettings.value)
  expect(baselineSettings.value).not.toBe(localSettings.value)

  localSettings.value = {
    projectName: 'Edited',
    schemaVersion: 1
  }

  expect(baselineSettings.value?.projectName).toBe('Realm')
})

/**
 * captureDialogProjectSettingsBaselines
 * Null locals copy as null baselines without cloning.
 */
test('Test that captureDialogProjectSettingsBaselines keeps null drafts as null', () => {
  const localSettings = ref<I_faProjectSettingsRoot | null>(null)
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)
  const baselineSettings = ref<I_faProjectSettingsRoot | null>({
    projectName: 'stale',
    schemaVersion: 1
  })
  const baselineWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([])
  const baselineDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([])

  captureDialogProjectSettingsBaselines({
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    localDocumentTemplates,
    localSettings,
    localWorlds
  })

  expect(baselineSettings.value).toBeNull()
  expect(baselineWorlds.value).toBeNull()
  expect(baselineDocumentTemplates.value).toBeNull()
})
