import type { I_programSettingRenderItem } from 'app/types/I_dialogProgramSettings'

const ACCESSIBILITY_CATEGORY_KEY = 'accessibility'
const DEVELOPER_SETTINGS_CATEGORY_KEY = 'developerSettings'

/**
 * Tab order: ordinary category keys sort alphabetically, then 'accessibility', then 'developerSettings' last.
 */
export function compareProgramSettingsCategoryOrder (
  categoryA: string,
  categoryB: string
): number {
  if (categoryA === categoryB) {
    return 0
  }

  const rank = (key: string): number => {
    if (key === DEVELOPER_SETTINGS_CATEGORY_KEY) {
      return 2
    }
    if (key === ACCESSIBILITY_CATEGORY_KEY) {
      return 1
    }
    return 0
  }

  const rankA = rank(categoryA)
  const rankB = rank(categoryB)
  if (rankA !== rankB) {
    return rankA - rankB
  }
  return categoryA.localeCompare(categoryB)
}

export function toSortedRecord<T> (record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)))
}

/**
 * Stable alphabetical order by rendered setting title (current locale), then by setting key.
 */
export function sortSettingsListByTranslatedTitle (
  settingsList: Record<string, I_programSettingRenderItem>
): Record<string, I_programSettingRenderItem> {
  return Object.fromEntries(
    Object.entries(settingsList).sort(([keyA, itemA], [keyB, itemB]) => {
      const titleCmp = itemA.title.localeCompare(itemB.title, undefined, {
        sensitivity: 'base'
      })
      if (titleCmp !== 0) {
        return titleCmp
      }
      return keyA.localeCompare(keyB)
    })
  )
}
