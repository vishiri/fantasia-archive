import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectDocumentTemplateSnapshotItem } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'
import type { Ref } from 'app/types/I_vueCompositionRefs'

import { mapDialogProjectSettingsDocumentTemplatesToSnapshot } from './dialogProjectSettingsDocumentTemplatesDraft'
import { isDialogProjectSettingsFullDialogSaveDisabled } from './dialogProjectSettingsDialogSaveValidation'
import { mapDialogProjectSettingsWorldsToSnapshot } from './dialogProjectSettingsWorldsSnapshotDraft'

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
  dialogModel: Ref<boolean>
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): Promise<void> {
  const { dialogModel, localDocumentTemplates, localSettings, localWorlds } = params
  if (
    localSettings.value === null ||
    localWorlds.value === null ||
    localDocumentTemplates.value === null
  ) {
    return
  }
  const trimmedName = localSettings.value.projectName.trim()
  if (
    isDialogProjectSettingsFullDialogSaveDisabled(
      trimmedName,
      localWorlds.value,
      localDocumentTemplates.value
    )
  ) {
    return
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
    return
  }
  dialogModel.value = false
}
