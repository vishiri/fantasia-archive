import type { I_faProjectDocumentTemplateTitleSingularTranslations } from 'app/types/I_faProjectDocumentTemplateTitleSingularTranslations'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

export const PROJECT_HIERARCHY_TREE_ADD_NEW_MISSING_TRANSLATION_TOKEN = 'MISSING TRANSLATION'

function readTrimmedTranslation (
  translations: Record<string, string | undefined>,
  languageCode: T_faUserSettingsLanguageCode
): string {
  const value = translations[languageCode]
  if (value === undefined) {
    return ''
  }
  return value.trim()
}

/**
 * Resolves the template title fragment for add-new row labels and new-document display names.
 * Fallback: singular preferred -> plural preferred -> singular en-US -> plural en-US -> missing token.
 */
export function resolveProjectHierarchyTreeAddNewTemplateTitlePart (input: {
  preferredLanguageCode: T_faUserSettingsLanguageCode
  titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
  titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
}): string {
  const singularPreferred = readTrimmedTranslation(
    input.titleSingularTranslations,
    input.preferredLanguageCode
  )
  if (singularPreferred.length > 0) {
    return singularPreferred
  }
  const pluralPreferred = readTrimmedTranslation(
    input.titlePluralTranslations,
    input.preferredLanguageCode
  )
  if (pluralPreferred.length > 0) {
    return pluralPreferred
  }
  const singularEnUs = readTrimmedTranslation(input.titleSingularTranslations, 'en-US')
  if (singularEnUs.length > 0) {
    return singularEnUs
  }
  const pluralEnUs = readTrimmedTranslation(input.titlePluralTranslations, 'en-US')
  if (pluralEnUs.length > 0) {
    return pluralEnUs
  }
  return PROJECT_HIERARCHY_TREE_ADD_NEW_MISSING_TRANSLATION_TOKEN
}

function formatProjectHierarchyTreeAddNewTemplateFragment (templatePart: string): string {
  if (templatePart === PROJECT_HIERARCHY_TREE_ADD_NEW_MISSING_TRANSLATION_TOKEN) {
    return templatePart
  }
  return templatePart.toLocaleLowerCase()
}

export function formatProjectHierarchyTreeAddNewRowLabel (templatePart: string): string {
  return `Add new ${formatProjectHierarchyTreeAddNewTemplateFragment(templatePart)}`
}

export function formatProjectHierarchyTreeNewDocumentDisplayName (templatePart: string): string {
  return `New ${formatProjectHierarchyTreeAddNewTemplateFragment(templatePart)}`
}

export function resolveProjectHierarchyTreeAddNewRowLabel (input: {
  preferredLanguageCode: T_faUserSettingsLanguageCode
  titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
  titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
}): string {
  const templatePart = resolveProjectHierarchyTreeAddNewTemplateTitlePart(input)
  return formatProjectHierarchyTreeAddNewRowLabel(templatePart)
}

export function resolveProjectHierarchyTreeNewDocumentDisplayName (input: {
  preferredLanguageCode: T_faUserSettingsLanguageCode
  titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
  titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
}): string {
  const templatePart = resolveProjectHierarchyTreeAddNewTemplateTitlePart(input)
  return formatProjectHierarchyTreeNewDocumentDisplayName(templatePart)
}
