import type { T_faUserSettingsLanguageNamesKey } from 'app/types/faUserSettingsLanguageRegistry'
import type { T_faUserSettingsLanguageSelectorRow } from 'app/types/faUserSettingsLanguageRegistry'

const latinDisplayNameCollator = new Intl.Collator('en', {
  sensitivity: 'base',
  usage: 'sort'
})

/**
 * Sorts selector rows by endonym label using Latin (English) alphabetical order.
 */
export function sortGlobalLanguageSelectorLocalesByLatinDisplayName (
  rows: readonly T_faUserSettingsLanguageSelectorRow[],
  displayNamesByKey: Readonly<Record<T_faUserSettingsLanguageNamesKey, string>>
): T_faUserSettingsLanguageSelectorRow[] {
  const sortedRows = [...rows]
  sortedRows.sort((left, right) => {
    return compareGlobalLanguageSelectorLocalesByLatinDisplayName(
      left,
      right,
      displayNamesByKey
    )
  })
  return sortedRows
}

function compareGlobalLanguageSelectorLocalesByLatinDisplayName (
  left: T_faUserSettingsLanguageSelectorRow,
  right: T_faUserSettingsLanguageSelectorRow,
  displayNamesByKey: Readonly<Record<T_faUserSettingsLanguageNamesKey, string>>
): number {
  const leftDisplayName = displayNamesByKey[left.languageNamesKey]
  const rightDisplayName = displayNamesByKey[right.languageNamesKey]
  return latinDisplayNameCollator.compare(leftDisplayName, rightDisplayName)
}
