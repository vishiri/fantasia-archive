import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type {
  I_appSettingsSettingRenderItem,
  I_appSettingsSubCategoryRenderItem,
  T_appSettingsRenderTree
} from 'app/types/I_dialogAppSettings'
import { APP_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogAppSettings/_data/appSettingsOptions'
import {
  compareAppSettingsCategoryOrder,
  sortSettingsListByTranslatedTitle,
  toSortedRecord
} from 'app/src/components/dialogs/DialogAppSettings/scripts/dialogAppSettingsTreeOrdering'
import { i18n } from 'app/i18n/externalFileLoader'

export {
  compareAppSettingsCategoryOrder,
  sortSettingsListByTranslatedTitle,
  toSortedRecord
}

type T_appSettingsManagedKey = keyof typeof APP_SETTINGS_OPTIONS

function buildAppSettingsSettingLeaf (
  settingKey: string,
  normalizedSettingKey: T_appSettingsManagedKey,
  settingsSnapshot: I_faUserSettings
): I_appSettingsSettingRenderItem {
  const noteTranslationPath = `dialogs.appSettings.appOptions.${settingKey}.note`
  const noteValue = i18n.global.te(noteTranslationPath) ? i18n.global.t(noteTranslationPath) : undefined

  const leaf: I_appSettingsSettingRenderItem = {
    title: i18n.global.t(`dialogs.appSettings.appOptions.${settingKey}.title`),
    description: i18n.global.t(`dialogs.appSettings.appOptions.${settingKey}.description`),
    value: settingsSnapshot[normalizedSettingKey],
    tags: i18n.global.t(`dialogs.appSettings.appOptions.${settingKey}.tags`)
  }

  if (noteValue !== undefined) {
    leaf.note = noteValue
  }

  return leaf
}

function appendOneSnapshotKeyToUnsortedTree (
  unsortedTree: T_appSettingsRenderTree,
  settingsSnapshot: I_faUserSettings,
  settingKey: string
): void {
  if (!Object.hasOwn(APP_SETTINGS_OPTIONS, settingKey)) {
    return
  }

  const normalizedSettingKey = settingKey as T_appSettingsManagedKey
  const settingOption = APP_SETTINGS_OPTIONS[normalizedSettingKey]
  const categoryKey = settingOption.category
  const subCategoryKey = settingOption.subcategory

  if (unsortedTree[categoryKey] === undefined) {
    unsortedTree[categoryKey] = {
      title: i18n.global.t(`dialogs.appSettings.appOptionsCategories.${categoryKey}.title`),
      subCategories: {}
    }
  }

  if (unsortedTree[categoryKey].subCategories[subCategoryKey] === undefined) {
    unsortedTree[categoryKey].subCategories[subCategoryKey] = {
      title: i18n.global.t(`dialogs.appSettings.appOptionsCategories.${categoryKey}.${subCategoryKey}.subtitle`),
      settingsList: {}
    }
  }

  const leaf = buildAppSettingsSettingLeaf(settingKey, normalizedSettingKey, settingsSnapshot)
  unsortedTree[categoryKey].subCategories[subCategoryKey].settingsList[settingKey] = leaf
}

function sortUnsortedAppSettingsTree (unsortedTree: T_appSettingsRenderTree): T_appSettingsRenderTree {
  const sortedCategoryEntries = Object.entries(unsortedTree).sort(([categoryA], [categoryB]) =>
    compareAppSettingsCategoryOrder(categoryA, categoryB)
  )
  const sortedTree: T_appSettingsRenderTree = {}

  for (const [categoryKey, categoryValue] of sortedCategoryEntries) {
    const sortedSubCategories = toSortedRecord(categoryValue.subCategories)
    const sortedCategorySubTrees: Record<string, I_appSettingsSubCategoryRenderItem> = {}

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

export function buildAppSettingsRenderTree (settingsSnapshot: I_faUserSettings): T_appSettingsRenderTree {
  const unsortedTree: T_appSettingsRenderTree = {}
  const settingKeys = Object.keys(settingsSnapshot).sort((keyA, keyB) => keyA.localeCompare(keyB))

  for (const settingKey of settingKeys) {
    appendOneSnapshotKeyToUnsortedTree(unsortedTree, settingsSnapshot, settingKey)
  }

  return sortUnsortedAppSettingsTree(unsortedTree)
}
