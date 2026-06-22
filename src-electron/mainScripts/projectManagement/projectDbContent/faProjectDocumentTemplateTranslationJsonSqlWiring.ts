import { serializeFaProjectDocumentTemplateTitleTranslationsJson } from 'app/src-electron/shared/faProjectDocumentTemplateTitleTranslationsSchema'
import { serializeFaProjectDocumentTemplateWorldAppendixTranslationsJson } from 'app/src-electron/shared/faProjectDocumentTemplateWorldAppendixTranslationsSchema'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'

export function buildFaProjectDocumentTemplateTitleTranslationsJsonFromDisplayName (
  displayName: string
): string {
  const titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations = {
    'en-US': displayName
  }
  return serializeFaProjectDocumentTemplateTitleTranslationsJson(titlePluralTranslations)
}

export function buildFaProjectDocumentTemplateWorldAppendixTranslationsJsonFromText (
  worldAppendix: string
): string {
  const trimmed = worldAppendix.trim()
  if (trimmed.length === 0) {
    return serializeFaProjectDocumentTemplateWorldAppendixTranslationsJson({})
  }
  const worldAppendixTranslations: I_faProjectDocumentTemplateWorldAppendixTranslations = {
    'en-US': trimmed
  }
  return serializeFaProjectDocumentTemplateWorldAppendixTranslationsJson(worldAppendixTranslations)
}
