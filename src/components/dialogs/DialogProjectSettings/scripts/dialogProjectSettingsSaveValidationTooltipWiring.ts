import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type {
  I_dialogProjectSettingsSaveValidationError,
  I_dialogProjectSettingsSaveValidationTooltipContent,
  I_dialogProjectSettingsWorldDraft
} from 'app/types/I_dialogProjectSettingsWorlds'

import { resolveDialogProjectSettingsDocumentTemplateSaveErrorDisplayName } from './dialogProjectSettingsDocumentTemplatesDraft'
import { collectDialogProjectSettingsFullSaveValidationErrors } from './dialogProjectSettingsDialogSaveValidation'
import { resolveDialogProjectSettingsWorldSaveErrorDisplayName } from './dialogProjectSettingsWorldsDisplayNameDraft'
import { collectDuplicateDocumentTemplateIdsInWorldTemplateLayout } from './functions/dialogProjectSettingsWorldTemplateLayoutDuplicateValidation'
import {
  buildDialogProjectSettingsSaveValidationTooltip,
  collectDialogProjectSettingsSaveValidationErrors
} from './functions/dialogProjectSettingsWorldsSaveValidation'

import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

export function createBuildDialogProjectSettingsSaveValidationTooltip (deps: {
  resolveDefaultNewTemplateName: () => string
  resolveDefaultNewWorldName: () => string
  getCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  translate: (key: string, params?: Record<string, string>) => string
}): (
    projectName: string,
    worlds: I_dialogProjectSettingsWorldDraft[] | null,
    documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
  ) => I_dialogProjectSettingsSaveValidationTooltipContent {
  function resolveErrorMessage (
    error: I_dialogProjectSettingsSaveValidationError,
    worldsList: I_dialogProjectSettingsWorldDraft[] | null,
    templatesList: I_dialogProjectSettingsDocumentTemplateDraft[] | null
  ): string {
    if (error.kind === 'projectNameRequired') {
      return deps.translate('dialogs.projectSettings.fields.projectName.errorRequired')
    }
    if (error.kind === 'documentTemplateNameRequired') {
      const templateIndex = error.templateIndexOneBased ?? 1
      const template = templatesList?.[templateIndex - 1]
      const templateLabel = resolveDialogProjectSettingsDocumentTemplateSaveErrorDisplayName(
        template?.titleTranslations ?? {},
        deps.getCurrentLanguageCode(),
        deps.resolveDefaultNewTemplateName()
      )
      return deps.translate('dialogs.projectSettings.saveErrors.bulletDocumentTemplateNameRequired', {
        templateLabel
      })
    }
    const worldIndex = error.worldIndexOneBased ?? 1
    const world = worldsList?.[worldIndex - 1]
    const worldLabel = resolveDialogProjectSettingsWorldSaveErrorDisplayName(
      world?.displayNameTranslations ?? {},
      deps.getCurrentLanguageCode(),
      deps.resolveDefaultNewWorldName()
    )
    if (error.kind === 'worldNameRequired') {
      return deps.translate('dialogs.projectSettings.saveErrors.bulletWorldNameRequired', {
        worldLabel
      })
    }
    if (error.kind === 'worldTemplateGroupNameRequired') {
      return deps.translate('dialogs.projectSettings.saveErrors.bulletWorldTemplateGroupNameRequired', {
        worldLabel
      })
    }
    if (error.kind === 'worldTemplateDuplicateDocumentTemplate') {
      const duplicateIds = world === undefined
        ? new Set<string>()
        : collectDuplicateDocumentTemplateIdsInWorldTemplateLayout(world.templateLayout)
      const firstDuplicateId = [...duplicateIds][0] ?? ''
      const duplicatePlacement = world?.templateLayout.placements.find((placement) => {
        return placement.documentTemplateId === firstDuplicateId
      })
      const templateLabel = duplicatePlacement === undefined
        ? deps.resolveDefaultNewTemplateName()
        : (duplicatePlacement.nickname.trim().length > 0
            ? duplicatePlacement.nickname.trim()
            : duplicatePlacement.templateDisplayName.trim().length > 0
              ? duplicatePlacement.templateDisplayName.trim()
              : deps.resolveDefaultNewTemplateName())
      return deps.translate('dialogs.projectSettings.saveErrors.bulletWorldTemplateDuplicateDocumentTemplate', {
        templateLabel,
        worldLabel
      })
    }
    return deps.translate('dialogs.projectSettings.saveErrors.bulletDuplicatePalette', {
      worldLabel
    })
  }

  return function buildDialogProjectSettingsSaveValidationTooltipForDraft (
    projectName: string,
    worlds: I_dialogProjectSettingsWorldDraft[] | null,
    documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
  ): I_dialogProjectSettingsSaveValidationTooltipContent {
    const errors = collectDialogProjectSettingsFullSaveValidationErrors(
      projectName,
      worlds,
      documentTemplates
    )
    const introLine = deps.translate('dialogs.projectSettings.saveErrors.tooltipIntro')
    return buildDialogProjectSettingsSaveValidationTooltip(
      errors,
      introLine,
      (error) => resolveErrorMessage(error, worlds, documentTemplates)
    )
  }
}

export {
  collectDialogProjectSettingsSaveValidationErrors
}
