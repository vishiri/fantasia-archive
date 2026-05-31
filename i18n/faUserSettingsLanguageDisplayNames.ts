import type { T_faUserSettingsLanguageNamesKey } from 'app/types/faUserSettingsLanguageRegistry'

/**
 * Endonym labels for the language selector. Every locale appends a localized suffix with unified 'AI'.
 */
export const FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES: Record<T_faUserSettingsLanguageNamesKey, string> = {
  ar: 'العربية (مُولَّد بواسطة AI)',
  de: 'Deutsch (AI-generiert)',
  el: 'Ελληνικά (δημιουργήθηκε με AI)',
  enUS: 'English, US',
  es: 'Español (generado por AI)',
  fi: 'Suomi (AI-generoitu)',
  fr: 'Français (généré par AI)',
  hi: 'हिन्दी (AI-जनित)',
  it: 'Italiano (generato da AI)',
  ja: '日本語 (AI生成)',
  nb: 'Norsk (AI-generert)',
  pt: 'Português (gerado por AI)',
  ru: 'Русский (сгенерировано AI)',
  sv: 'Svenska (AI-genererad)',
  uk: 'Українська (згенеровано AI)',
  zh: '中文 (AI 生成)'
}
