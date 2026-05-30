import { FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES } from 'app/i18n/faUserSettingsLanguageDisplayNames'
import { buildFaUserSettingsLanguageSelectorLocales } from 'app/types/faUserSettingsLanguageRegistry'

import { sortGlobalLanguageSelectorLocalesByLatinDisplayName } from './functions/sortGlobalLanguageSelectorLocalesByLatinDisplayName'

export const GLOBAL_LANGUAGE_SELECTOR_LOCALES = sortGlobalLanguageSelectorLocalesByLatinDisplayName(
  buildFaUserSettingsLanguageSelectorLocales(),
  FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES
)
