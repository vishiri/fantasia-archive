import { FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES } from 'app/i18n/faUserSettingsLanguageDisplayNames'
import type { T_faUserSettingsLanguageSelectorRow } from 'app/types/faUserSettingsLanguageRegistry'

const latinDisplayNameCollator = new Intl.Collator('en', {
  sensitivity: 'base',
  usage: 'sort'
})

/**
 * Sorts selector rows by endonym label using Latin (English) alphabetical order.
 */
export function sortGlobalLanguageSelectorLocalesByLatinDisplayName (
  rows: readonly T_faUserSettingsLanguageSelectorRow[]
): T_faUserSettingsLanguageSelectorRow[] {
  const sortedRows = [...rows]
  sortedRows.sort(compareGlobalLanguageSelectorLocalesByLatinDisplayName)
  return sortedRows
}

function compareGlobalLanguageSelectorLocalesByLatinDisplayName (
  left: T_faUserSettingsLanguageSelectorRow,
  right: T_faUserSettingsLanguageSelectorRow
): number {
  const leftDisplayName = FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES[left.languageNamesKey]
  const rightDisplayName = FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES[right.languageNamesKey]
  return latinDisplayNameCollator.compare(leftDisplayName, rightDisplayName)
}
