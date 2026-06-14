import type {
  I_dialogProjectSettingsSaveValidationError,
  I_dialogProjectSettingsSaveValidationTooltipContent,
  I_dialogProjectSettingsWorldDraft
} from 'app/types/I_dialogProjectSettingsWorlds'

import {
  buildDialogProjectSettingsSaveValidationTooltip,
  collectDialogProjectSettingsSaveValidationErrors,
  resolveDialogProjectSettingsWorldSaveErrorDisplayName
} from './functions/dialogProjectSettingsWorldsDraft'

export function createBuildDialogProjectSettingsSaveValidationTooltip (deps: {
  defaultNewWorldName: string
  translate: (key: string, params?: Record<string, string>) => string
}): (
    projectName: string,
    worlds: I_dialogProjectSettingsWorldDraft[] | null
  ) => I_dialogProjectSettingsSaveValidationTooltipContent {
  function resolveErrorMessage (
    error: I_dialogProjectSettingsSaveValidationError,
    worldsList: I_dialogProjectSettingsWorldDraft[] | null
  ): string {
    if (error.kind === 'projectNameRequired') {
      return deps.translate('dialogs.projectSettings.fields.projectName.errorRequired')
    }
    const worldIndex = error.worldIndexOneBased ?? 1
    const world = worldsList?.[worldIndex - 1]
    const worldLabel = resolveDialogProjectSettingsWorldSaveErrorDisplayName(
      world?.displayName ?? '',
      deps.defaultNewWorldName
    )
    if (error.kind === 'worldNameRequired') {
      return deps.translate('dialogs.projectSettings.saveErrors.bulletWorldNameRequired', {
        worldLabel
      })
    }
    return deps.translate('dialogs.projectSettings.saveErrors.bulletDuplicatePalette', {
      worldLabel
    })
  }

  return function buildDialogProjectSettingsSaveValidationTooltipForDraft (
    projectName: string,
    worlds: I_dialogProjectSettingsWorldDraft[] | null
  ): I_dialogProjectSettingsSaveValidationTooltipContent {
    const errors = collectDialogProjectSettingsSaveValidationErrors(projectName, worlds)
    const introLine = deps.translate('dialogs.projectSettings.saveErrors.tooltipIntro')
    return buildDialogProjectSettingsSaveValidationTooltip(
      errors,
      introLine,
      (error) => resolveErrorMessage(error, worlds)
    )
  }
}
