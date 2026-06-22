import { createI18n } from 'vue-i18n'

const DIALOG_PROJECT_SETTINGS_VITEST_FALLBACK_LANGUAGE_NAMES: Record<string, string> = {
  de: 'Deutsch (AI-generiert)',
  'en-US': 'English, US'
}

export function createDialogProjectSettingsVitestI18n (
  extraProjectSettingsMessages: Record<string, unknown> = {}
): ReturnType<typeof createI18n> {
  return createI18n({
    legacy: false,
    locale: 'en-US',
    missingWarn: false,
    missing: (_locale, key) => key,
    messages: {
      'en-US': {
        dialogs: {
          projectSettings: {
            singularPluralMissing: {
              bothIntro: 'Missing translations for current language:',
              pluralBullet: 'Plural form missing',
              singularBullet: 'Singular form missing',
              usingFallback: 'Using fallback of {fallbackLanguageName}'
            },
            ...extraProjectSettingsMessages
          }
        }
      }
    }
  })
}

export const dialogProjectSettingsVitestI18nPlugin = createDialogProjectSettingsVitestI18n()

export function mergeDialogProjectSettingsVitestGlobal (
  global: Record<string, unknown> = {}
): Record<string, unknown> {
  const existingPlugins = Array.isArray(global.plugins) ? global.plugins : []
  return {
    ...global,
    plugins: [dialogProjectSettingsVitestI18nPlugin, ...existingPlugins]
  }
}

export function buildDialogProjectSettingsSingularPluralMissingTooltip (params: {
  fallbackLanguageCode: string | null
  missingForm: 'both' | 'plural' | 'singular'
}): string {
  const lines: string[] = []
  if (params.missingForm === 'both') {
    lines.push('Missing translations for current language:')
    lines.push('- Singular form missing')
    lines.push('- Plural form missing')
  } else if (params.missingForm === 'plural') {
    lines.push('Missing translations for current language:')
    lines.push('- Plural form missing')
  } else {
    lines.push('Missing translations for current language:')
    lines.push('- Singular form missing')
  }
  if (params.fallbackLanguageCode !== null) {
    const fallbackLanguageName =
      DIALOG_PROJECT_SETTINGS_VITEST_FALLBACK_LANGUAGE_NAMES[params.fallbackLanguageCode] ??
      params.fallbackLanguageCode
    lines.push(`Using fallback of ${fallbackLanguageName}`)
  }
  return lines.join('\n')
}
