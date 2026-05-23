import {
  buildFaUserSettingsLanguageSelectorLocales
} from 'app/types/faUserSettingsLanguageRegistry'

import { sortGlobalLanguageSelectorLocalesByLatinDisplayName } from './sortGlobalLanguageSelectorLocalesByLatinDisplayName'

export type { T_globalLanguageSelectorLocaleRow } from './globalLanguageSelectorLocaleRow'

export const GLOBAL_LANGUAGE_SELECTOR_LOCALES = sortGlobalLanguageSelectorLocalesByLatinDisplayName(
  buildFaUserSettingsLanguageSelectorLocales()
)
