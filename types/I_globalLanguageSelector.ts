import type {
  T_faUserSettingsLanguageCode,
  T_faUserSettingsLanguageNamesKey
} from 'app/types/faUserSettingsLanguageRegistry'

/** One locale row in the Global language selector menu. */
export type T_globalLanguageSelectorLocaleRow = {
  code: T_faUserSettingsLanguageCode
  flagSrc: string
  languageNamesKey: T_faUserSettingsLanguageNamesKey
}
