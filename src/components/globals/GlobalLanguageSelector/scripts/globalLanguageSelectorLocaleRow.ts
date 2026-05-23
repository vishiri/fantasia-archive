import type {
  T_faUserSettingsLanguageCode,
  T_faUserSettingsLanguageNamesKey
} from 'app/types/faUserSettingsLanguageRegistry'

export type T_globalLanguageSelectorLocaleRow = {
  code: T_faUserSettingsLanguageCode
  flagSrc: string
  languageNamesKey: T_faUserSettingsLanguageNamesKey
}
