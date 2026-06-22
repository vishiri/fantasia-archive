import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { Ref } from 'app/types/I_vueCompositionRefs'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { syncDialogProjectSettingsWorldsTemplateLayoutPlacementLocalizedLabels } from './dialogProjectSettingsDocumentTemplateWorldLayoutSync'

export function syncDialogProjectSettingsAllWorldTemplateLayoutLocalizedPlacementLabels (params: {
  getCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): void {
  if (params.localWorlds.value === null || params.localDocumentTemplates.value === null) {
    return
  }
  params.localWorlds.value = syncDialogProjectSettingsWorldsTemplateLayoutPlacementLocalizedLabels(
    params.localWorlds.value,
    params.localDocumentTemplates.value,
    params.getCurrentLanguageCode()
  )
}

export function syncDialogProjectSettingsDocumentTemplateLayoutTitles (params: {
  documentTemplateId: string
  getCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): void {
  if (params.localDocumentTemplates.value === null) {
    return
  }
  const templateExists = params.localDocumentTemplates.value.some((row) => {
    return row.id === params.documentTemplateId
  })
  if (!templateExists) {
    return
  }
  syncDialogProjectSettingsAllWorldTemplateLayoutLocalizedPlacementLabels({
    getCurrentLanguageCode: params.getCurrentLanguageCode,
    localDocumentTemplates: params.localDocumentTemplates,
    localWorlds: params.localWorlds
  })
}
