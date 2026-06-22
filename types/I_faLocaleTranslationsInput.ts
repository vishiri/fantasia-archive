/** Display and menu input shape for FaLocaleTranslationsInput. */
export type T_faLocaleTranslationsInputMode = 'multiline' | 'singleLine'

export const FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_WIDTH_PX = 500

export const FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_HEIGHT_PX = 600

export const FA_LOCALE_TRANSLATIONS_INPUT_MENU_VIEWPORT_MARGIN_PX = 16

export const FA_LOCALE_TRANSLATIONS_INPUT_MENU_OFFSET_Y_PX = 4

/** Default multiline row count when inputMode is multiline and rows prop is omitted. */
export const FA_LOCALE_TRANSLATIONS_INPUT_DEFAULT_TEXTAREA_ROWS = 3

export type I_faLocaleTranslationsInputLocaleRow = {
  code: import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  displayName: string
}
