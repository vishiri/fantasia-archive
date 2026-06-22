import type { I_faLocaleSingularPluralMissingTranslationWarning } from 'app/types/I_faLocaleSingularPluralMissingTranslationWarning'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

/**
 * Builds newline-separated tooltip copy for singular/plural missing-translation warnings.
 * Render with FaMultilineTooltipBody in q-tooltip (plain interpolation collapses line breaks).
 */
export function formatFaLocaleSingularPluralMissingTranslationWarningTooltip (params: {
  activeLanguageCode: T_faUserSettingsLanguageCode
  readFallbackLanguageName: (languageCode: T_faUserSettingsLanguageCode) => string
  translate: (key: string, translateParams?: Record<string, string>) => string
  warning: I_faLocaleSingularPluralMissingTranslationWarning
}): string {
  const lines: string[] = []
  const missingForm = params.warning.missingForm

  if (missingForm === 'both') {
    lines.push(params.translate('dialogs.projectSettings.singularPluralMissing.bothIntro'))
    lines.push(`- ${params.translate('dialogs.projectSettings.singularPluralMissing.singularBullet')}`)
    lines.push(`- ${params.translate('dialogs.projectSettings.singularPluralMissing.pluralBullet')}`)
  } else if (missingForm === 'plural') {
    lines.push(params.translate('dialogs.projectSettings.singularPluralMissing.bothIntro'))
    lines.push(`- ${params.translate('dialogs.projectSettings.singularPluralMissing.pluralBullet')}`)
  } else {
    lines.push(params.translate('dialogs.projectSettings.singularPluralMissing.bothIntro'))
    lines.push(`- ${params.translate('dialogs.projectSettings.singularPluralMissing.singularBullet')}`)
  }

  const fallbackLanguageCode = params.warning.fallbackLanguageCode
  if (
    fallbackLanguageCode !== null &&
    fallbackLanguageCode !== params.activeLanguageCode
  ) {
    lines.push(
      params.translate('dialogs.projectSettings.singularPluralMissing.usingFallback', {
        fallbackLanguageName: params.readFallbackLanguageName(fallbackLanguageCode)
      })
    )
  }

  return lines.join('\n')
}
