import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'

import { areFaJsonSnapshotsEqual } from 'app/src/scripts/_utilities/faJsonSnapshotsEqual'

export function createDialogProjectSettingsIsDirtyComputed (deps: {
  computed: <T>(getter: () => T) => ComputedRef<T>
}, params: {
  baselineDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  baselineSettings: Ref<I_faProjectSettingsRoot | null>
  baselineWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): ComputedRef<boolean> {
  const {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    localDocumentTemplates,
    localSettings,
    localWorlds
  } = params

  return deps.computed((): boolean => {
    if (
      localSettings.value === null ||
      baselineSettings.value === null ||
      localWorlds.value === null ||
      baselineWorlds.value === null ||
      localDocumentTemplates.value === null ||
      baselineDocumentTemplates.value === null
    ) {
      return false
    }
    return !(
      areFaJsonSnapshotsEqual(localSettings.value, baselineSettings.value) &&
      areFaJsonSnapshotsEqual(localWorlds.value, baselineWorlds.value) &&
      areFaJsonSnapshotsEqual(localDocumentTemplates.value, baselineDocumentTemplates.value)
    )
  })
}
