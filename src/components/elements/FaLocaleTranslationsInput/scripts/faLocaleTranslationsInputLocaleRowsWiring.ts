import { FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES } from 'app/i18n/faUserSettingsLanguageDisplayNames'
import type { I_faLocaleTranslationsInputLocaleRow } from 'app/types/I_faLocaleTranslationsInput'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { GLOBAL_LANGUAGE_SELECTOR_LOCALES } from 'app/src/components/globals/GlobalLanguageSelector/scripts/globalLanguageSelectorLocales_manager'

export const buildFaLocaleTranslationsInputLocaleRows = (
  currentLanguageCode: T_faUserSettingsLanguageCode
): I_faLocaleTranslationsInputLocaleRow[] => {
  const rows = GLOBAL_LANGUAGE_SELECTOR_LOCALES.map((localeRow) => {
    const displayName = FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES[localeRow.languageNamesKey]
    return {
      code: localeRow.code,
      displayName
    }
  })
  const preferredIndex = rows.findIndex((localeRow) => localeRow.code === currentLanguageCode)
  if (preferredIndex <= 0) {
    return rows
  }
  const preferredRow = rows[preferredIndex]!
  const remainingRows = rows.filter((localeRow) => localeRow.code !== currentLanguageCode)
  return [preferredRow, ...remainingRows]
}
