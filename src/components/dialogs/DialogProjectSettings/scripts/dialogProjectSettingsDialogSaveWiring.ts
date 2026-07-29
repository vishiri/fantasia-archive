import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectDocumentTemplateSnapshotItem } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'
import type { Ref } from 'app/types/I_vueCompositionRefs'

import { captureDialogProjectSettingsBaselines } from './dialogProjectSettingsDialogBaselineWiring'
import { mapDialogProjectSettingsDocumentTemplatesToSnapshot } from './dialogProjectSettingsDocumentTemplatesDraft'
import { isDialogProjectSettingsFullDialogSaveDisabled } from './dialogProjectSettingsDialogSaveValidation'
import { mapDialogProjectSettingsWorldsToSnapshot } from './dialogProjectSettingsWorldsSnapshotDraft'

export async function persistDialogProjectSettingsDraft (deps: {
  runFaActionAwait: (
    id: 'saveProjectSettings',
    payload: {
      documentTemplates?: I_faProjectDocumentTemplateSnapshotItem[]
      settings: { projectName: string }
      worlds?: I_faProjectWorldSnapshotItem[]
    }
  ) => Promise<boolean>
}, params: {
  baselineDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  baselineSettings: Ref<I_faProjectSettingsRoot | null>
  baselineWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): Promise<boolean> {
  const {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    localDocumentTemplates,
    localSettings,
    localWorlds
  } = params
  if (
    localSettings.value === null ||
    localWorlds.value === null ||
    localDocumentTemplates.value === null
  ) {
    return false
  }
  const trimmedName = localSettings.value.projectName.trim()
  if (
    isDialogProjectSettingsFullDialogSaveDisabled(
      trimmedName,
      localWorlds.value,
      localDocumentTemplates.value
    )
  ) {
    return false
  }
  const worldsSnapshot = mapDialogProjectSettingsWorldsToSnapshot(localWorlds.value)
  const documentTemplatesSnapshot = mapDialogProjectSettingsDocumentTemplatesToSnapshot(
    localDocumentTemplates.value
  )
  const saved = await deps.runFaActionAwait('saveProjectSettings', {
    documentTemplates: documentTemplatesSnapshot,
    settings: {
      projectName: trimmedName
    },
    worlds: worldsSnapshot
  })
  if (!saved) {
    return false
  }
  captureDialogProjectSettingsBaselines({
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    localDocumentTemplates,
    localSettings,
    localWorlds
  })
  return true
}

export async function saveDialogProjectSettingsDraftWithoutClosing (
  deps: Parameters<typeof persistDialogProjectSettingsDraft>[0],
  params: Parameters<typeof persistDialogProjectSettingsDraft>[1]
): Promise<void> {
  await persistDialogProjectSettingsDraft(deps, params)
}

export async function saveDialogProjectSettingsDraftAndClose (deps: {
  runFaActionAwait: (
    id: 'saveProjectSettings',
    payload: {
      documentTemplates?: I_faProjectDocumentTemplateSnapshotItem[]
      settings: { projectName: string }
      worlds?: I_faProjectWorldSnapshotItem[]
    }
  ) => Promise<boolean>
}, params: {
  baselineDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  baselineSettings: Ref<I_faProjectSettingsRoot | null>
  baselineWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  dialogModel: Ref<boolean>
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): Promise<void> {
  const {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    dialogModel,
    localDocumentTemplates,
    localSettings,
    localWorlds
  } = params
  const saved = await persistDialogProjectSettingsDraft(deps, {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    localDocumentTemplates,
    localSettings,
    localWorlds
  })
  if (!saved) {
    return
  }
  dialogModel.value = false
}
