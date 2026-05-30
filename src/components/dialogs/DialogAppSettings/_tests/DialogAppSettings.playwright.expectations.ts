import { APP_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogAppSettings/_data/appSettingsOptions'
import type {
  I_appSettingsSubCategoryRenderItem,
  T_appSettingsRenderTree
} from 'app/types/I_dialogAppSettings'
import {
  compareAppSettingsCategoryOrder,
  sortSettingsListByTranslatedTitle,
  toSortedRecord
} from 'app/src/components/dialogs/DialogAppSettings/scripts/functions/dialogAppSettingsTreeBuild'
import appSettingsMessages from 'app/i18n/en-US/dialogs/L_appSettings'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
type T_appSettingsOptionMessageBlock = {
  title: string
  description: string
  tags: string
  note?: string
}

/**
 * vue-i18n compiles some escapes differently than the raw TS module string; align with DOM text.
 */
const normalizeExpectedSettingDescription = (description: string): string => {
  return description.replace(/\\\|/g, '|')
}

/**
 * Builds the ordered app settings tree from en-US L_appSettings and APP_SETTINGS_OPTIONS keys with default values from FA_USER_SETTINGS_DEFAULTS, matching buildAppSettingsRenderTree (category rank, alphabetical keys, title sort within subcategories). Keys such as languageCode that are not in APP_SETTINGS_OPTIONS are omitted from the dialog.
 *
 * - Dialog strings come from dialogs.appSettings, not globalFunctionality.faUserSettings.
 */
export function buildExpectedAppSettingsTreeFromEnUsMessages (): T_appSettingsRenderTree {
  const cats = appSettingsMessages.appOptionsCategories
  const appOpts = appSettingsMessages.appOptions as Record<string, T_appSettingsOptionMessageBlock>
  const unsortedTree: T_appSettingsRenderTree = {}
  const settingKeys = (Object.keys(APP_SETTINGS_OPTIONS) as Array<keyof typeof APP_SETTINGS_OPTIONS>)
    .slice()
    .sort((keyA, keyB) => String(keyA).localeCompare(String(keyB)))

  for (const settingKey of settingKeys) {
    const meta = APP_SETTINGS_OPTIONS[settingKey]
    const categoryKey = meta.category
    const subCategoryKey = meta.subcategory

    if (unsortedTree[categoryKey] === undefined) {
      const catBlock = cats[categoryKey as keyof typeof cats] as {
        title: string
      }
      unsortedTree[categoryKey] = {
        title: catBlock.title,
        subCategories: {}
      }
    }

    if (unsortedTree[categoryKey].subCategories[subCategoryKey] === undefined) {
      const catBlock = cats[categoryKey as keyof typeof cats] as Record<string, {
        subtitle?: string
      }>
      const subBlock = catBlock[subCategoryKey]
      unsortedTree[categoryKey].subCategories[subCategoryKey] = {
        title: subBlock.subtitle ?? '',
        settingsList: {}
      }
    }

    const optBlock = appOpts[settingKey]
    const note = optBlock.note

    unsortedTree[categoryKey].subCategories[subCategoryKey].settingsList[settingKey] = {
      title: optBlock.title,
      description: normalizeExpectedSettingDescription(optBlock.description),
      tags: optBlock.tags,
      value: FA_USER_SETTINGS_DEFAULTS[settingKey],
      ...(note !== undefined && note !== '' ? { note } : {})
    }
  }

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
