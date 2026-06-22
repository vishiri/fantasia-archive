/**
 * Canonical interface-language codes, selector metadata, and spellchecker tag candidates.
 */
export const FA_USER_SETTINGS_LANGUAGE_CODES = [
  'en-US',
  'de',
  'fr',
  'it',
  'sv',
  'fi',
  'nb',
  'pt',
  'es',
  'el',
  'uk',
  'ar',
  'zh',
  'ja',
  'hi',
  'ru'
] as const

export type T_faUserSettingsLanguageCode = (typeof FA_USER_SETTINGS_LANGUAGE_CODES)[number]

export type T_faUserSettingsLanguageNamesKey =
  | 'enUS'
  | Exclude<T_faUserSettingsLanguageCode, 'en-US'>

export type T_faUserSettingsLanguageSelectorRow = {
  code: T_faUserSettingsLanguageCode
  flagSrc: string
  languageNamesKey: T_faUserSettingsLanguageNamesKey
}

const FLAG_BY_CODE: Record<T_faUserSettingsLanguageCode, string> = {
  'en-US': '/countryFlags/us.svg',
  ar: '/countryFlags/sa.svg',
  de: '/countryFlags/de.svg',
  el: '/countryFlags/gr.svg',
  es: '/countryFlags/es.svg',
  fi: '/countryFlags/fi.svg',
  fr: '/countryFlags/fr.svg',
  hi: '/countryFlags/in.svg',
  it: '/countryFlags/it.svg',
  ja: '/countryFlags/jp.svg',
  nb: '/countryFlags/no.svg',
  pt: '/countryFlags/pt.svg',
  ru: '/countryFlags/ru.svg',
  sv: '/countryFlags/se.svg',
  uk: '/countryFlags/ua.svg',
  zh: '/countryFlags/cn.svg'
}

export const FA_SPELL_CHECKER_CANDIDATES_BY_LANGUAGE_CODE: Record<
  T_faUserSettingsLanguageCode,
  readonly string[]
> = {
  'en-US': ['en-US', 'en-GB', 'en'],
  ar: ['ar', 'ar-SA', 'ar-EG'],
  de: ['de', 'de-DE'],
  el: ['el', 'el-GR'],
  es: ['es', 'es-ES'],
  fi: ['fi', 'fi-FI'],
  fr: ['fr', 'fr-FR'],
  hi: ['hi', 'hi-IN'],
  it: ['it', 'it-IT'],
  ja: ['ja', 'ja-JP'],
  nb: ['nb', 'nb-NO', 'no', 'no-NO'],
  pt: ['pt', 'pt-PT', 'pt-BR'],
  ru: ['ru', 'ru-RU'],
  sv: ['sv', 'sv-SE'],
  uk: ['uk', 'uk-UA'],
  zh: ['zh-CN', 'zh', 'zh-TW']
}

const SPELL_CHECKER_FAMILY_BY_CODE: Partial<Record<T_faUserSettingsLanguageCode, string>> = {
  nb: 'nb'
}

export function faUserSettingsLanguageCodeToNamesKey (
  code: T_faUserSettingsLanguageCode
): T_faUserSettingsLanguageNamesKey {
  if (code === 'en-US') {
    return 'enUS'
  }

  return code
}

export function buildFaUserSettingsLanguageSelectorLocales (): T_faUserSettingsLanguageSelectorRow[] {
  return FA_USER_SETTINGS_LANGUAGE_CODES.map((code) => {
    return {
      code,
      flagSrc: FLAG_BY_CODE[code],
      languageNamesKey: faUserSettingsLanguageCodeToNamesKey(code)
    }
  })
}

export function isFaUserSettingsLanguageCode (value: string): value is T_faUserSettingsLanguageCode {
  return (FA_USER_SETTINGS_LANGUAGE_CODES as readonly string[]).includes(value)
}

export function resolveFaSpellCheckerLanguageFamilyPrefix (
  languageCode: T_faUserSettingsLanguageCode
): string | null {
  if (languageCode === 'en-US') {
    return null
  }

  return SPELL_CHECKER_FAMILY_BY_CODE[languageCode] ?? languageCode
}
