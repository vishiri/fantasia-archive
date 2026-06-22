/** Display and menu input shape for FaLocaleTranslationsInput. */
export type T_faLocaleTranslationsInputMode = 'multiline' | 'singleLine'

/** single — one string per locale; singularPlural — singular + plural columns per locale. */
export type T_faLocaleTranslationsInputTranslationForms = 'single' | 'singularPlural'

/**
 * field — readonly summary input opens locale menu (default).
 * menuPanel — locale rows only; embed inside an outer menu (e.g. template layout tree rename).
 */
export type T_faLocaleTranslationsInputPresentation = 'field' | 'menuPanel'

export const FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_WIDTH_PX = 500

/** Minimum teleported locale menu width (also matches anchor when wider). */
export const FA_LOCALE_TRANSLATIONS_INPUT_MENU_MIN_WIDTH_PX = 350

/** Wider menu cap when translationForms is singularPlural (dual columns). */
export const FA_LOCALE_TRANSLATIONS_INPUT_MENU_SINGULAR_PLURAL_MAX_WIDTH_PX = 700

/** Minimum menu width when translationForms is singularPlural (dual columns). */
export const FA_LOCALE_TRANSLATIONS_INPUT_MENU_SINGULAR_PLURAL_MIN_WIDTH_PX = 650

export const FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_HEIGHT_PX = 450

export const FA_LOCALE_TRANSLATIONS_INPUT_MENU_VIEWPORT_MARGIN_PX = 16

export const FA_LOCALE_TRANSLATIONS_INPUT_MENU_OFFSET_Y_PX = 4

/** Default multiline row count when inputMode is multiline and rows prop is omitted. */
export const FA_LOCALE_TRANSLATIONS_INPUT_DEFAULT_TEXTAREA_ROWS = 3

export type I_faLocaleTranslationsInputLocaleRow = {
  code: import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  displayName: string
}
