import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faProjectWorldTemplatePlacementNicknameSingularTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameSingularTranslations'
import type { I_faProjectWorldTemplatePlacementNicknameTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

export function buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations (input: {
  nicknamePluralTranslations: I_faProjectWorldTemplatePlacementNicknameTranslations
  nicknameSingularTranslations: I_faProjectWorldTemplatePlacementNicknameSingularTranslations
}): I_faLocaleSingularPluralTranslations {
  return {
    plural: input.nicknamePluralTranslations,
    singular: input.nicknameSingularTranslations
  }
}

export function createNormalizeFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations (deps: {
  normalizePlural: (
    translations: I_faProjectWorldTemplatePlacementNicknameTranslations
  ) => I_faProjectWorldTemplatePlacementNicknameTranslations
  normalizeSingular: (
    translations: I_faProjectWorldTemplatePlacementNicknameSingularTranslations
  ) => I_faProjectWorldTemplatePlacementNicknameSingularTranslations
}): (input: {
    nicknamePluralTranslations: I_faProjectWorldTemplatePlacementNicknameTranslations
    nicknameSingularTranslations: I_faProjectWorldTemplatePlacementNicknameSingularTranslations
  }) => {
    nicknamePluralTranslations: I_faProjectWorldTemplatePlacementNicknameTranslations
    nicknameSingularTranslations: I_faProjectWorldTemplatePlacementNicknameSingularTranslations
  } {
  return function normalizeFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations (input: {
    nicknamePluralTranslations: I_faProjectWorldTemplatePlacementNicknameTranslations
    nicknameSingularTranslations: I_faProjectWorldTemplatePlacementNicknameSingularTranslations
  }): {
      nicknamePluralTranslations: I_faProjectWorldTemplatePlacementNicknameTranslations
      nicknameSingularTranslations: I_faProjectWorldTemplatePlacementNicknameSingularTranslations
    } {
    return {
      nicknamePluralTranslations: deps.normalizePlural(input.nicknamePluralTranslations),
      nicknameSingularTranslations: deps.normalizeSingular(input.nicknameSingularTranslations)
    }
  }
}

export function createResolveFaProjectWorldTemplatePlacementNicknameFromFields (deps: {
  buildSingularPlural: typeof buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations
  resolveNickname: (
    translations: I_faLocaleSingularPluralTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ) => string
}): (
    nicknamePluralTranslations: I_faProjectWorldTemplatePlacementNicknameTranslations,
    nicknameSingularTranslations: I_faProjectWorldTemplatePlacementNicknameSingularTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ) => string {
  return function resolveFaProjectWorldTemplatePlacementNicknameFromFields (
    nicknamePluralTranslations: I_faProjectWorldTemplatePlacementNicknameTranslations,
    nicknameSingularTranslations: I_faProjectWorldTemplatePlacementNicknameSingularTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ): string {
    return deps.resolveNickname(
      deps.buildSingularPlural({
        nicknamePluralTranslations,
        nicknameSingularTranslations
      }),
      preferredLanguageCode
    )
  }
}
