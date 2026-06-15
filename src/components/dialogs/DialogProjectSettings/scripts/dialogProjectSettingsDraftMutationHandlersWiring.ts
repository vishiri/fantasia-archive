import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { Ref } from 'app/types/I_vueCompositionRefs'

import {
  addDialogProjectSettingsDocumentTemplateDraftRow,
  removeDialogProjectSettingsDocumentTemplateDraftRow,
  updateDialogProjectSettingsDocumentTemplateDraftDisplayName,
  updateDialogProjectSettingsDocumentTemplateDraftIcon,
  updateDialogProjectSettingsDocumentTemplateDraftWorldAppendix
} from './dialogProjectSettingsDocumentTemplateRowMutationsWiring'
import {
  addDialogProjectSettingsWorldDraftRow,
  removeDialogProjectSettingsWorldDraftRow,
  updateDialogProjectSettingsWorldDraftColor,
  updateDialogProjectSettingsWorldDraftColorPallete,
  updateDialogProjectSettingsWorldDraftDisplayName
} from './dialogProjectSettingsWorldRowMutationsWiring'

export function createDialogProjectSettingsDraftMutationHandlers (deps: {
  newTemplateDefaultDisplayName: string
  newWorldDefaultDisplayName: string
}, params: {
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): {
    addDocumentTemplate: () => void
    addWorld: () => void
    removeDocumentTemplate: (id: string) => void
    removeWorld: (id: string) => void
    updateDocumentTemplateDisplayName: (id: string, displayName: string) => void
    updateDocumentTemplateIcon: (id: string, icon: string) => void
    updateDocumentTemplateWorldAppendix: (id: string, worldAppendix: string) => void
    updateWorldColor: (id: string, color: string) => void
    updateWorldColorPallete: (id: string, colorPallete: string) => void
    updateWorldDisplayName: (id: string, displayName: string) => void
  } {
  const { localDocumentTemplates, localWorlds } = params

  const addDocumentTemplate = (): void => {
    addDialogProjectSettingsDocumentTemplateDraftRow(
      localDocumentTemplates,
      deps.newTemplateDefaultDisplayName
    )
  }

  const addWorld = (): void => {
    addDialogProjectSettingsWorldDraftRow(localWorlds, deps.newWorldDefaultDisplayName)
  }

  const removeDocumentTemplate = (id: string): void => {
    removeDialogProjectSettingsDocumentTemplateDraftRow(localDocumentTemplates, id)
  }

  const removeWorld = (id: string): void => {
    removeDialogProjectSettingsWorldDraftRow(localWorlds, id)
  }

  const updateDocumentTemplateDisplayName = (id: string, displayName: string): void => {
    updateDialogProjectSettingsDocumentTemplateDraftDisplayName(
      localDocumentTemplates,
      id,
      displayName
    )
  }

  const updateDocumentTemplateIcon = (id: string, icon: string): void => {
    updateDialogProjectSettingsDocumentTemplateDraftIcon(localDocumentTemplates, id, icon)
  }

  const updateDocumentTemplateWorldAppendix = (id: string, worldAppendix: string): void => {
    updateDialogProjectSettingsDocumentTemplateDraftWorldAppendix(
      localDocumentTemplates,
      id,
      worldAppendix
    )
  }

  const updateWorldColor = (id: string, color: string): void => {
    updateDialogProjectSettingsWorldDraftColor(localWorlds, id, color)
  }

  const updateWorldColorPallete = (id: string, colorPallete: string): void => {
    updateDialogProjectSettingsWorldDraftColorPallete(localWorlds, id, colorPallete)
  }

  const updateWorldDisplayName = (id: string, displayName: string): void => {
    updateDialogProjectSettingsWorldDraftDisplayName(localWorlds, id, displayName)
  }

  return {
    addDocumentTemplate,
    addWorld,
    removeDocumentTemplate,
    removeWorld,
    updateDocumentTemplateDisplayName,
    updateDocumentTemplateIcon,
    updateDocumentTemplateWorldAppendix,
    updateWorldColor,
    updateWorldColorPallete,
    updateWorldDisplayName
  }
}
