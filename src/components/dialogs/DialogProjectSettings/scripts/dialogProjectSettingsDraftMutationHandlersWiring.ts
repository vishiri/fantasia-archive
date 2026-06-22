import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { Ref } from 'app/types/I_vueCompositionRefs'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'

import {
  addDialogProjectSettingsDocumentTemplateDraftRow,
  removeDialogProjectSettingsDocumentTemplateDraftRow,
  updateDialogProjectSettingsDocumentTemplateDraftIcon,
  updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations,
  updateDialogProjectSettingsDocumentTemplateDraftWorldAppendixTranslations
} from './dialogProjectSettingsDocumentTemplateRowMutationsWiring'
import {
  syncDialogProjectSettingsDocumentTemplateLayoutTitles
} from './dialogProjectSettingsDocumentTemplateLayoutTitleSyncWiring'
import { createDialogProjectSettingsWorldDraftMutationHandlers } from './dialogProjectSettingsWorldDraftMutationHandlersWiring'

export function createDialogProjectSettingsDraftMutationHandlers (deps: {
  getCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  resolveNewTemplateDefaultDisplayName: () => string
  resolveNewWorldDefaultDisplayName: () => string
}, params: {
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): {
    addDocumentTemplate: () => void
    addWorld: () => void
    removeDocumentTemplate: (id: string) => void
    removeWorld: (id: string) => void
    updateDocumentTemplateIcon: (id: string, icon: string) => void
    updateDocumentTemplateTitleTranslations: (
      id: string,
      titleTranslations: I_faProjectDocumentTemplateTitleTranslations
    ) => void
    updateDocumentTemplateWorldAppendixTranslations: (
      id: string,
      worldAppendixTranslations: I_faProjectDocumentTemplateWorldAppendixTranslations
    ) => void
    updateWorldColor: (id: string, color: string) => void
    updateWorldColorPallete: (id: string, colorPallete: string) => void
    updateWorldDisplayNameTranslations: (
      id: string,
      displayNameTranslations: I_faProjectWorldDisplayNameTranslations
    ) => void
    updateWorldTemplateLayout: (
      id: string,
      templateLayout: I_dialogProjectSettingsWorldDraft['templateLayout']
    ) => void
  } {
  const { localDocumentTemplates, localWorlds } = params
  const worldHandlers = createDialogProjectSettingsWorldDraftMutationHandlers(deps, { localWorlds })

  const addDocumentTemplate = (): void => {
    addDialogProjectSettingsDocumentTemplateDraftRow(
      localDocumentTemplates,
      deps.getCurrentLanguageCode(),
      deps.resolveNewTemplateDefaultDisplayName()
    )
  }

  const removeDocumentTemplate = (id: string): void => {
    removeDialogProjectSettingsDocumentTemplateDraftRow(localDocumentTemplates, id)
  }

  const updateDocumentTemplateTitleTranslations = (
    id: string,
    titleTranslations: I_faProjectDocumentTemplateTitleTranslations
  ): void => {
    updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations(
      localDocumentTemplates,
      id,
      titleTranslations
    )
    syncDialogProjectSettingsDocumentTemplateLayoutTitles({
      documentTemplateId: id,
      getCurrentLanguageCode: deps.getCurrentLanguageCode,
      localDocumentTemplates,
      localWorlds
    })
  }

  const updateDocumentTemplateIcon = (id: string, icon: string): void => {
    updateDialogProjectSettingsDocumentTemplateDraftIcon(localDocumentTemplates, id, icon)
  }

  const updateDocumentTemplateWorldAppendixTranslations = (
    id: string,
    worldAppendixTranslations: I_faProjectDocumentTemplateWorldAppendixTranslations
  ): void => {
    updateDialogProjectSettingsDocumentTemplateDraftWorldAppendixTranslations(
      localDocumentTemplates,
      id,
      worldAppendixTranslations
    )
  }

  return {
    addDocumentTemplate,
    addWorld: worldHandlers.addWorld,
    removeDocumentTemplate,
    removeWorld: worldHandlers.removeWorld,
    updateDocumentTemplateIcon,
    updateDocumentTemplateTitleTranslations,
    updateDocumentTemplateWorldAppendixTranslations,
    updateWorldColor: worldHandlers.updateWorldColor,
    updateWorldColorPallete: worldHandlers.updateWorldColorPallete,
    updateWorldDisplayNameTranslations: worldHandlers.updateWorldDisplayNameTranslations,
    updateWorldTemplateLayout: worldHandlers.updateWorldTemplateLayout
  }
}
