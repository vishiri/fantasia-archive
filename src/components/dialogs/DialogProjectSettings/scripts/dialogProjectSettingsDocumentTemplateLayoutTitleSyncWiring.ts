import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { Ref } from 'app/types/I_vueCompositionRefs'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { syncDialogProjectSettingsWorldDraftTemplateLayoutPlacementDisplayNames } from './dialogProjectSettingsDocumentTemplateWorldLayoutSync'
import { resolveDialogProjectSettingsDocumentTemplateResolvedTitle } from './dialogProjectSettingsDocumentTemplatesDraft'

export function syncDialogProjectSettingsDocumentTemplateLayoutTitles (params: {
  documentTemplateId: string
  getCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): void {
  if (params.localWorlds.value === null || params.localDocumentTemplates.value === null) {
    return
  }
  const template = params.localDocumentTemplates.value.find((row) => {
    return row.id === params.documentTemplateId
  })
  if (template === undefined) {
    return
  }
  const resolvedTitle = resolveDialogProjectSettingsDocumentTemplateResolvedTitle(
    template,
    params.getCurrentLanguageCode()
  )
  params.localWorlds.value = syncDialogProjectSettingsWorldDraftTemplateLayoutPlacementDisplayNames(
    params.localWorlds.value,
    params.documentTemplateId,
    resolvedTitle
  )
}
