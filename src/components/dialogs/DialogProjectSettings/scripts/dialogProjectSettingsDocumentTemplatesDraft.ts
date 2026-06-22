import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectDocumentTemplateSnapshotItem } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import {
  hasFaProjectDocumentTemplateTitleTranslation,
  normalizeFaProjectDocumentTemplateTitles,
  resolveFaProjectDocumentTemplateDisplayTitle,
  resolveFaProjectDocumentTemplateDisplayTitleLanguageCode
} from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager'
import { normalizeDialogProjectSettingsDocumentTemplateWorldAppendixTranslations } from './dialogProjectSettingsDocumentTemplateWorldAppendixDraft'

/**
 * Resolves the document template title shown in Project Settings for the active UI language.
 */
export function resolveDialogProjectSettingsDocumentTemplateResolvedTitle (
  template: Pick<I_dialogProjectSettingsDocumentTemplateDraft, 'titleTranslations'>,
  languageCode: T_faUserSettingsLanguageCode
): string {
  return resolveFaProjectDocumentTemplateDisplayTitle(template.titleTranslations, languageCode)
}

/**
 * Language code whose translation supplies the resolved title, or null when no title exists.
 */
export function resolveDialogProjectSettingsDocumentTemplateResolvedTitleLanguageCode (
  template: Pick<I_dialogProjectSettingsDocumentTemplateDraft, 'titleTranslations'>,
  languageCode: T_faUserSettingsLanguageCode
): T_faUserSettingsLanguageCode | null {
  return resolveFaProjectDocumentTemplateDisplayTitleLanguageCode(
    template.titleTranslations,
    languageCode
  )
}

/**
 * True when the active UI language has no title and a fallback locale supplies the shown name.
 */
export function isDialogProjectSettingsDocumentTemplateResolvedTitleUsingFallback (
  template: Pick<I_dialogProjectSettingsDocumentTemplateDraft, 'titleTranslations'>,
  languageCode: T_faUserSettingsLanguageCode
): boolean {
  const resolvedLanguageCode = resolveDialogProjectSettingsDocumentTemplateResolvedTitleLanguageCode(
    template,
    languageCode
  )
  return resolvedLanguageCode !== null && resolvedLanguageCode !== languageCode
}

/**
 * True when any document template field that supports translations lacks a value for the active UI language.
 */
export function isDialogProjectSettingsDocumentTemplateMissingCurrentLanguageTranslations (
  template: Pick<I_dialogProjectSettingsDocumentTemplateDraft, 'titleTranslations'>,
  languageCode: T_faUserSettingsLanguageCode
): boolean {
  const titleTranslation = template.titleTranslations[languageCode] ?? ''
  if (titleTranslation.trim().length === 0) {
    return true
  }
  return false
}

/**
 * Resolves the q-icon name shown for a document template row (empty draft uses placeholder).
 */
export function resolveDialogProjectSettingsDocumentTemplateDisplayIcon (
  icon: string,
  emptyPlaceholderIcon: string
): string {
  const trimmed = icon.trim()
  if (trimmed.length > 0) {
    return trimmed
  }
  return emptyPlaceholderIcon
}

/**
 * True when a document template has no non-empty title translation in any locale.
 */
export function isDialogProjectSettingsDocumentTemplateNameInvalid (
  titleTranslations: I_faProjectDocumentTemplateTitleTranslations
): boolean {
  return !hasFaProjectDocumentTemplateTitleTranslation(titleTranslations)
}

/**
 * True when a document template tab row should use validation error styling.
 */
export function isDialogProjectSettingsDocumentTemplateTabValidationError (
  template: I_dialogProjectSettingsDocumentTemplateDraft
): boolean {
  return isDialogProjectSettingsDocumentTemplateNameInvalid(template.titleTranslations)
}

/**
 * True when any document template row has no valid title translation.
 */
export function hasDialogProjectSettingsDocumentTemplateNameValidationError (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
): boolean {
  if (templates === null) {
    return true
  }
  return templates.some((template) => {
    return isDialogProjectSettingsDocumentTemplateNameInvalid(template.titleTranslations)
  })
}

/**
 * Document template ids with no valid title translation.
 */
export function collectInvalidDialogProjectSettingsDocumentTemplateIds (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
): Set<string> {
  const invalidIds = new Set<string>()
  if (templates === null) {
    return invalidIds
  }
  for (const template of templates) {
    if (isDialogProjectSettingsDocumentTemplateNameInvalid(template.titleTranslations)) {
      invalidIds.add(template.id)
    }
  }
  return invalidIds
}

/**
 * Resolves the quoted template name used in save-validation messages.
 */
export function resolveDialogProjectSettingsDocumentTemplateSaveErrorDisplayName (
  titleTranslations: I_faProjectDocumentTemplateTitleTranslations,
  languageCode: T_faUserSettingsLanguageCode,
  defaultNewTemplateName: string
): string {
  const resolved = resolveDialogProjectSettingsDocumentTemplateResolvedTitle(
    { titleTranslations },
    languageCode
  )
  return resolved.length > 0 ? resolved : defaultNewTemplateName
}

/**
 * Maps dialog draft rows to the IPC snapshot payload.
 */
export function mapDialogProjectSettingsDocumentTemplatesToSnapshot (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[]
): I_faProjectDocumentTemplateSnapshotItem[] {
  return templates.map((template) => {
    const item: I_faProjectDocumentTemplateSnapshotItem = {
      id: template.id,
      titleTranslations: normalizeFaProjectDocumentTemplateTitles(template.titleTranslations)
    }
    const normalizedAppendixTranslations =
      normalizeDialogProjectSettingsDocumentTemplateWorldAppendixTranslations(
        template.worldAppendixTranslations
      )
    if (Object.keys(normalizedAppendixTranslations).length > 0) {
      item.worldAppendixTranslations = normalizedAppendixTranslations
    }
    const trimmedIcon = template.icon.trim()
    if (trimmedIcon.length > 0) {
      item.icon = trimmedIcon
    }
    return item
  })
}

/**
 * Appends a new draft document template row at the bottom of the list.
 */
export function appendDialogProjectSettingsDocumentTemplateDraft (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[],
  languageCode: T_faUserSettingsLanguageCode,
  defaultDisplayName: string
): I_dialogProjectSettingsDocumentTemplateDraft[] {
  const id = crypto.randomUUID()
  const titleTranslations: I_faProjectDocumentTemplateTitleTranslations = {
    [languageCode]: defaultDisplayName
  }
  return [
    ...templates,
    {
      documentCount: 0,
      icon: '',
      id,
      titleTranslations,
      worldAppendixTranslations: {}
    }
  ]
}

/**
 * True when the remove control must stay disabled for this template row.
 */
export function isDialogProjectSettingsDocumentTemplateRemoveDisabled (
  template: I_dialogProjectSettingsDocumentTemplateDraft
): boolean {
  return template.documentCount > 0
}
