import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faProjectDocumentTemplateTitleSingularTranslations } from 'app/types/I_faProjectDocumentTemplateTitleSingularTranslations'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

export function buildFaProjectDocumentTemplateTitleSingularPluralTranslations (input: {
  titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
  titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
}): I_faLocaleSingularPluralTranslations {
  return {
    plural: input.titlePluralTranslations,
    singular: input.titleSingularTranslations
  }
}

export function createNormalizeFaProjectDocumentTemplateTitleSingularPluralTranslations (deps: {
  normalizePlural: (
    translations: I_faProjectDocumentTemplateTitleTranslations
  ) => I_faProjectDocumentTemplateTitleTranslations
  normalizeSingular: (
    translations: I_faProjectDocumentTemplateTitleSingularTranslations
  ) => I_faProjectDocumentTemplateTitleSingularTranslations
}): (input: {
    titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
    titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
  }) => {
    titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
    titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
  } {
  return function normalizeFaProjectDocumentTemplateTitleSingularPluralTranslations (input: {
    titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
    titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
  }): {
      titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
      titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
    } {
    return {
      titlePluralTranslations: deps.normalizePlural(input.titlePluralTranslations),
      titleSingularTranslations: deps.normalizeSingular(input.titleSingularTranslations)
    }
  }
}

export function createResolveFaProjectDocumentTemplateDisplayTitleFromFields (deps: {
  buildSingularPlural: typeof buildFaProjectDocumentTemplateTitleSingularPluralTranslations
  resolveDisplayTitle: (
    translations: I_faLocaleSingularPluralTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ) => string
}): (
    titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations,
    titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ) => string {
  return function resolveFaProjectDocumentTemplateDisplayTitleFromFields (
    titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations,
    titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ): string {
    return deps.resolveDisplayTitle(
      deps.buildSingularPlural({
        titlePluralTranslations,
        titleSingularTranslations
      }),
      preferredLanguageCode
    )
  }
}
