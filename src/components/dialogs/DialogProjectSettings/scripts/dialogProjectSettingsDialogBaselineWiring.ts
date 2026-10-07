import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { Ref } from 'app/types/I_vueCompositionRefs'

function cloneJsonSnapshot<T> (value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/**
 * Snapshot current Project Settings drafts as the sticky-dirty baseline.
 */
export function captureDialogProjectSettingsBaselines (params: {
  baselineDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  baselineSettings: Ref<I_faProjectSettingsRoot | null>
  baselineWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): void {
  const {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    localDocumentTemplates,
    localSettings,
    localWorlds
  } = params

  baselineSettings.value = localSettings.value === null
    ? null
    : cloneJsonSnapshot(localSettings.value)
  baselineWorlds.value = localWorlds.value === null
    ? null
    : cloneJsonSnapshot(localWorlds.value)
  baselineDocumentTemplates.value = localDocumentTemplates.value === null
    ? null
    : cloneJsonSnapshot(localDocumentTemplates.value)
}

/**
 * Deep copy of the drafts about to be saved. Later keystrokes stay out of this copy.
 */
export function cloneDialogProjectSettingsDraftsForSave (params: {
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): {
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[]
  settings: I_faProjectSettingsRoot
  worlds: I_dialogProjectSettingsWorldDraft[]
} | null {
  const localDocumentTemplates = params.localDocumentTemplates.value
  const localSettings = params.localSettings.value
  const localWorlds = params.localWorlds.value
  if (localDocumentTemplates === null || localSettings === null || localWorlds === null) {
    return null
  }
  const documentTemplates = cloneJsonSnapshot(localDocumentTemplates)
  const settings = cloneJsonSnapshot(localSettings)
  const worlds = cloneJsonSnapshot(localWorlds)
  return {
    documentTemplates,
    settings,
    worlds
  }
}

/**
 * Marks the drafts that were sent as the new clean baseline.
 */
export function applyDialogProjectSettingsSavedBaselines (params: {
  baselineDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  baselineSettings: Ref<I_faProjectSettingsRoot | null>
  baselineWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  savedDocumentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[]
  savedSettings: I_faProjectSettingsRoot
  savedWorlds: I_dialogProjectSettingsWorldDraft[]
}): void {
  const baselineDocumentTemplates = params.baselineDocumentTemplates
  const baselineSettings = params.baselineSettings
  const baselineWorlds = params.baselineWorlds
  const savedDocumentTemplates = params.savedDocumentTemplates
  const savedSettings = params.savedSettings
  const savedWorlds = params.savedWorlds
  baselineSettings.value = savedSettings
  baselineWorlds.value = savedWorlds
  baselineDocumentTemplates.value = savedDocumentTemplates
}
