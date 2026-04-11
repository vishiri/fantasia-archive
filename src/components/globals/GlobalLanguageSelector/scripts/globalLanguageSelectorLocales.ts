import type { T_faUserSettingsLanguageCode } from 'app/types/T_faUserSettingsLanguageCode'

export type T_globalLanguageSelectorLocaleRow = {
  code: T_faUserSettingsLanguageCode
  flagSrc: string
  languageNamesKey: 'enUS' | 'de' | 'fr'
}

export const GLOBAL_LANGUAGE_SELECTOR_LOCALES: T_globalLanguageSelectorLocaleRow[] = [
  {
    code: 'en-US',
    flagSrc: '/countryFlags/us.svg',
    languageNamesKey: 'enUS'
  },
  {
    code: 'de',
    flagSrc: '/countryFlags/de.svg',
    languageNamesKey: 'de'
  },
  {
    code: 'fr',
    flagSrc: '/countryFlags/fr.svg',
    languageNamesKey: 'fr'
  }
]
