import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { Ref } from 'app/types/I_vueCompositionRefs'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { syncDialogProjectSettingsAllWorldTemplateLayoutLocalizedPlacementLabels } from './dialogProjectSettingsDocumentTemplateLayoutTitleSyncWiring'

export function registerDialogProjectSettingsLanguageLayoutLabelsSyncWatcher (params: {
  getCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  watch: (source: () => unknown, effect: () => void) => void
}): void {
  params.watch(() => params.getCurrentLanguageCode(), () => {
    syncDialogProjectSettingsAllWorldTemplateLayoutLocalizedPlacementLabels({
      getCurrentLanguageCode: params.getCurrentLanguageCode,
      localDocumentTemplates: params.localDocumentTemplates,
      localWorlds: params.localWorlds
    })
  })
}
