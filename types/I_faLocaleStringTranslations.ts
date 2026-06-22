import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

/** Per-locale user-facing strings keyed by interface language code. */
export type I_faLocaleStringTranslations =
  Partial<Record<T_faUserSettingsLanguageCode, string>>
