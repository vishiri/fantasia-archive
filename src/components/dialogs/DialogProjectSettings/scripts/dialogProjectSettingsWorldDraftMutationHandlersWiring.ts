import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { Ref } from 'app/types/I_vueCompositionRefs'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'

import {
  addDialogProjectSettingsWorldDraftRow,
  removeDialogProjectSettingsWorldDraftRow,
  updateDialogProjectSettingsWorldDraftColor,
  updateDialogProjectSettingsWorldDraftColorPalette,
  updateDialogProjectSettingsWorldDraftDisplayNameTranslations,
  updateDialogProjectSettingsWorldDraftTemplateLayout
} from './dialogProjectSettingsWorldRowMutationsWiring'

export function createDialogProjectSettingsWorldDraftMutationHandlers (deps: {
  getCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  resolveNewWorldDefaultDisplayName: () => string
}, params: {
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): {
    addWorld: () => void
    removeWorld: (id: string) => void
    updateWorldColor: (id: string, color: string) => void
    updateWorldColorPalette: (id: string, colorPalette: string) => void
    updateWorldDisplayNameTranslations: (
      id: string,
      displayNameTranslations: I_faProjectWorldDisplayNameTranslations
    ) => void
    updateWorldTemplateLayout: (
      id: string,
      templateLayout: I_dialogProjectSettingsWorldDraft['templateLayout']
    ) => void
  } {
  const { localWorlds } = params

  const addWorld = (): void => {
    addDialogProjectSettingsWorldDraftRow(
      localWorlds,
      deps.getCurrentLanguageCode(),
      deps.resolveNewWorldDefaultDisplayName()
    )
  }

  const removeWorld = (id: string): void => {
    removeDialogProjectSettingsWorldDraftRow(localWorlds, id)
  }

  const updateWorldColor = (id: string, color: string): void => {
    updateDialogProjectSettingsWorldDraftColor(localWorlds, id, color)
  }

  const updateWorldColorPalette = (id: string, colorPalette: string): void => {
    updateDialogProjectSettingsWorldDraftColorPalette(localWorlds, id, colorPalette)
  }

  const updateWorldDisplayNameTranslations = (
    id: string,
    displayNameTranslations: I_faProjectWorldDisplayNameTranslations
  ): void => {
    updateDialogProjectSettingsWorldDraftDisplayNameTranslations(
      localWorlds,
      id,
      displayNameTranslations
    )
  }

  const updateWorldTemplateLayout = (
    id: string,
    templateLayout: I_dialogProjectSettingsWorldDraft['templateLayout']
  ): void => {
    updateDialogProjectSettingsWorldDraftTemplateLayout(localWorlds, id, templateLayout)
  }

  return {
    addWorld,
    removeWorld,
    updateWorldColor,
    updateWorldColorPalette,
    updateWorldDisplayNameTranslations,
    updateWorldTemplateLayout
  }
}
