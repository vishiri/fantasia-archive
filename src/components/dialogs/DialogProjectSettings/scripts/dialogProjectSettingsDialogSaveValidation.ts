import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsSaveValidationError } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'

import {
  hasDialogProjectSettingsDocumentTemplateNameValidationError,
  isDialogProjectSettingsDocumentTemplateNameInvalid
} from './functions/dialogProjectSettingsDocumentTemplatesDraft'
import {
  collectDialogProjectSettingsSaveValidationErrors,
  hasDialogProjectSettingsWorldColorPalleteValidationError,
  hasDialogProjectSettingsWorldNameValidationError,
  isDialogProjectSettingsDialogSaveDisabled,
  isDialogProjectSettingsProjectNameInvalid
} from './functions/dialogProjectSettingsWorldsSaveValidation'

/**
 * Collects template-specific save-blocking validation errors.
 */
export function collectDialogProjectSettingsDocumentTemplateSaveValidationErrors (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
): I_dialogProjectSettingsSaveValidationError[] {
  const errors: I_dialogProjectSettingsSaveValidationError[] = []
  if (templates === null) {
    return errors
  }
  for (let index = 0; index < templates.length; index += 1) {
    const template = templates[index]
    if (template === undefined) {
      continue
    }
    if (isDialogProjectSettingsDocumentTemplateNameInvalid(template.displayName)) {
      errors.push({
        kind: 'documentTemplateNameRequired',
        templateIndexOneBased: index + 1
      })
    }
  }
  return errors
}

/**
 * True when Save settings should stay disabled for the full dialog draft.
 */
export function isDialogProjectSettingsFullDialogSaveDisabled (
  projectName: string,
  worlds: I_dialogProjectSettingsWorldDraft[] | null,
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
): boolean {
  return isDialogProjectSettingsDialogSaveDisabled(projectName, worlds) ||
    hasDialogProjectSettingsDocumentTemplateNameValidationError(documentTemplates)
}

/**
 * Collects ordered save-blocking validation errors for the full Project Settings draft.
 */
export function collectDialogProjectSettingsFullSaveValidationErrors (
  projectName: string,
  worlds: I_dialogProjectSettingsWorldDraft[] | null,
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
): I_dialogProjectSettingsSaveValidationError[] {
  return [
    ...collectDialogProjectSettingsSaveValidationErrors(projectName, worlds),
    ...collectDialogProjectSettingsDocumentTemplateSaveValidationErrors(documentTemplates)
  ]
}

export {
  hasDialogProjectSettingsWorldColorPalleteValidationError,
  hasDialogProjectSettingsWorldNameValidationError,
  isDialogProjectSettingsProjectNameInvalid
}
