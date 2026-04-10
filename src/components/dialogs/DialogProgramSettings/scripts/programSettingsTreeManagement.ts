import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import { PROGRAM_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogProgramSettings/_data/programSettingsOptions'
import type {
  I_programSettingRenderItem,
  I_programSubCategoryRenderItem,
  T_programSettingsRenderTree
} from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import { i18n } from 'app/i18n/externalFileLoader'

import {
  compareProgramSettingsCategoryOrder,
  sortSettingsListByTranslatedTitle,
  toSortedRecord
} from './programSettingsTreeSorting'

function buildProgramSettingLeaf (
  settingKey: string,
  normalizedSettingKey: keyof I_faUserSettings,
  settingsSnapshot: I_faUserSettings
): I_programSettingRenderItem {
  const noteTranslationPath = `dialogs.programSettings.appOptions.${settingKey}.note`
  const noteValue = i18n.global.te(noteTranslationPath) ? i18n.global.t(noteTranslationPath) : undefined

  const leaf: I_programSettingRenderItem = {
    title: i18n.global.t(`dialogs.programSettings.appOptions.${settingKey}.title`),
    description: i18n.global.t(`dialogs.programSettings.appOptions.${settingKey}.description`),
    value: settingsSnapshot[normalizedSettingKey],
    tags: i18n.global.t(`dialogs.programSettings.appOptions.${settingKey}.tags`)
  }

  if (noteValue !== undefined) {
    leaf.note = noteValue
  }

  return leaf
}

function appendOneSnapshotKeyToUnsortedTree (
  unsortedTree: T_programSettingsRenderTree,
  settingsSnapshot: I_faUserSettings,
  settingKey: string
): void {
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

  const leaf = buildProgramSettingLeaf(settingKey, normalizedSettingKey, settingsSnapshot)
  unsortedTree[categoryKey].subCategories[subCategoryKey].settingsList[settingKey] = leaf
}

function sortUnsortedProgramSettingsTree (unsortedTree: T_programSettingsRenderTree): T_programSettingsRenderTree {
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

export function buildProgramSettingsRenderTree (settingsSnapshot: I_faUserSettings): T_programSettingsRenderTree {
  const unsortedTree: T_programSettingsRenderTree = {}
  const settingKeys = Object.keys(settingsSnapshot).sort((keyA, keyB) => keyA.localeCompare(keyB))

  for (const settingKey of settingKeys) {
    appendOneSnapshotKeyToUnsortedTree(unsortedTree, settingsSnapshot, settingKey)
  }

  return sortUnsortedProgramSettingsTree(unsortedTree)
}
