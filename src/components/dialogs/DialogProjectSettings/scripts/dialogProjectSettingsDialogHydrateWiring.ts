import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { Ref } from 'app/types/I_vueCompositionRefs'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { syncDialogProjectSettingsAllWorldTemplateLayoutLocalizedPlacementLabels } from './dialogProjectSettingsDocumentTemplateLayoutTitleSyncWiring'

export async function hydrateDialogProjectSettingsDrafts (deps: {
  faProjectDocumentTemplatesFetchFreshForDialog: () => Promise<I_dialogProjectSettingsDocumentTemplateDraft[]>
  faProjectSettingsFetchFreshForDialog: () => Promise<I_faProjectSettingsRoot>
  faProjectWorldsFetchFreshForDialog: () => Promise<I_dialogProjectSettingsWorldDraft[]>
  getCurrentLanguageCode: () => T_faUserSettingsLanguageCode
}, params: {
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  props: I_dialogProjectSettingsProps
}): Promise<void> {
  const { localDocumentTemplates, localSettings, localWorlds, props } = params
  if (props.directSettingsSnapshot !== undefined) {
    localSettings.value = { ...props.directSettingsSnapshot }
  } else {
    const snapshot = await deps.faProjectSettingsFetchFreshForDialog()
    localSettings.value = { ...snapshot }
  }
  if (props.directWorldsSnapshot !== undefined) {
    localWorlds.value = props.directWorldsSnapshot.map((world) => ({ ...world }))
  } else {
    const worlds = await deps.faProjectWorldsFetchFreshForDialog()
    localWorlds.value = worlds.map((world) => ({ ...world }))
  }
  if (props.directDocumentTemplatesSnapshot !== undefined) {
    localDocumentTemplates.value = props.directDocumentTemplatesSnapshot.map((template) => ({
      ...template
    }))
  } else {
    const templates = await deps.faProjectDocumentTemplatesFetchFreshForDialog()
    localDocumentTemplates.value = templates.map((template) => ({ ...template }))
  }
  syncDialogProjectSettingsAllWorldTemplateLayoutLocalizedPlacementLabels({
    getCurrentLanguageCode: deps.getCurrentLanguageCode,
    localDocumentTemplates,
    localWorlds
  })
}
