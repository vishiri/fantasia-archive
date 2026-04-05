import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import { PROGRAM_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogProgramSettings/_data/programSettingsOptions'
import type {
  I_programSettingRenderItem,
  I_programSubCategoryRenderItem,
  T_programSettingsRenderTree
} from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import { i18n } from 'app/src/i18n/externalFileLoader'

const ACCESSIBILITY_CATEGORY_KEY = 'accessibility'
const DEVELOPER_SETTINGS_CATEGORY_KEY = 'developerSettings'

/**
 * Tab order: all ordinary categories alphabetically, then **Accessibility**, then **Developer settings** last.
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

export function buildProgramSettingsRenderTree (settingsSnapshot: I_faUserSettings): T_programSettingsRenderTree {
  const unsortedTree: T_programSettingsRenderTree = {}
  const settingKeys = Object.keys(settingsSnapshot).sort((keyA, keyB) => keyA.localeCompare(keyB))

  for (const settingKey of settingKeys) {
    const normalizedSettingKey = settingKey as keyof I_faUserSettings
    const settingOption = PROGRAM_SETTINGS_OPTIONS[normalizedSettingKey]
    const categoryKey = settingOption.category
    const subCategoryKey = settingOption.subcategory

    if (unsortedTree[categoryKey] === undefined) {
      unsortedTree[categoryKey] = {
        title: i18n.global.t(`dialogs.programSettings.appOptionsCategories.${categoryKey}.title`),
        subCategories: {}
      }
    }

    if (unsortedTree[categoryKey].subCategories[subCategoryKey] === undefined) {
      unsortedTree[categoryKey].subCategories[subCategoryKey] = {
        title: i18n.global.t(`dialogs.programSettings.appOptionsCategories.${categoryKey}.${subCategoryKey}.subtitle`),
        settingsList: {}
      }
    }

    const noteTranslationPath = `dialogs.programSettings.appOptions.${settingKey}.note`
    const noteValue = i18n.global.te(noteTranslationPath) ? i18n.global.t(noteTranslationPath) : undefined

    unsortedTree[categoryKey].subCategories[subCategoryKey].settingsList[settingKey] = {
      title: i18n.global.t(`dialogs.programSettings.appOptions.${settingKey}.title`),
      description: i18n.global.t(`dialogs.programSettings.appOptions.${settingKey}.description`),
      value: settingsSnapshot[normalizedSettingKey],
      tags: i18n.global.t(`dialogs.programSettings.appOptions.${settingKey}.tags`),
      ...(noteValue !== undefined ? { note: noteValue } : {})
    }
  }

  const sortedCategoryEntries = Object.entries(unsortedTree).sort(([categoryA], [categoryB]) =>
    compareProgramSettingsCategoryOrder(categoryA, categoryB)
  )
  const sortedTree: T_programSettingsRenderTree = {}

  for (const [categoryKey, categoryValue] of sortedCategoryEntries) {
    const sortedSubCategories = toSortedRecord(categoryValue.subCategories)
    const sortedCategorySubTrees: Record<string, I_programSubCategoryRenderItem> = {}

    for (const [subCategoryKey, subCategoryValue] of Object.entries(sortedSubCategories)) {
      sortedCategorySubTrees[subCategoryKey] = {
        ...subCategoryValue,
        settingsList: sortSettingsListByTranslatedTitle(subCategoryValue.settingsList)
      }
    }

    sortedTree[categoryKey] = {
      ...categoryValue,
      subCategories: sortedCategorySubTrees
    }
  }

  return sortedTree
}
