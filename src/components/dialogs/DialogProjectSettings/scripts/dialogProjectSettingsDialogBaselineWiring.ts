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
