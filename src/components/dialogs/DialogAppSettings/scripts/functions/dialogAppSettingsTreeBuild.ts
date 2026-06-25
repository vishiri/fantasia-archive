import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type {
  I_appSettingsSettingRenderItem,
  I_appSettingsSubCategoryRenderItem,
  T_appSettingsRenderTree,
  T_dialogAppSettingsOptionMetadata,
  T_dialogAppSettingsTranslate
} from 'app/types/I_dialogAppSettings'

const ACCESSIBILITY_CATEGORY_KEY = 'accessibility'
const DEVELOPER_SETTINGS_CATEGORY_KEY = 'developerSettings'
const APP_SETTINGS_PAGE_CATEGORY_TITLE_PREFIX = 'page:'

function isAppSettingsPageCategoryTitle (categoryTitle: string): boolean {
  return categoryTitle.trim().toLocaleLowerCase().startsWith(APP_SETTINGS_PAGE_CATEGORY_TITLE_PREFIX)
}

function appSettingsCategorySortLabel (categoryKey: string, categoryTitle: string): string {
  if (categoryTitle !== '') {
    return categoryTitle
  }
  return categoryKey
}

/**
 * Tab order: Page-prefixed categories first (alphabetical by title), then other categories
 * (alphabetical by title), then accessibility, then developerSettings last.
 */
export function compareAppSettingsCategoryOrder (
  categoryA: string,
  categoryB: string,
  categoryTitleA = '',
  categoryTitleB = ''
): number {
  if (categoryA === categoryB) {
    return 0
  }

  const rank = (key: string, title: string): number => {
    if (key === DEVELOPER_SETTINGS_CATEGORY_KEY) {
      return 3
    }
    if (key === ACCESSIBILITY_CATEGORY_KEY) {
      return 2
    }
    if (isAppSettingsPageCategoryTitle(title)) {
      return 0
    }
    return 1
  }

  const rankA = rank(categoryA, categoryTitleA)
  const rankB = rank(categoryB, categoryTitleB)
  if (rankA !== rankB) {
    return rankA - rankB
  }

  const labelA = appSettingsCategorySortLabel(categoryA, categoryTitleA)
  const labelB = appSettingsCategorySortLabel(categoryB, categoryTitleB)
  return labelA.localeCompare(labelB, undefined, { sensitivity: 'base' })
}

export function toSortedRecord<T> (record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)))
}

/**
 * Stable alphabetical order by rendered setting title (current locale), then by setting key.
 */
export function sortSettingsListByTranslatedTitle (
  settingsList: Record<string, I_appSettingsSettingRenderItem>
): Record<string, I_appSettingsSettingRenderItem> {
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

function buildAppSettingsSettingLeaf (
  translate: T_dialogAppSettingsTranslate,
  settingKey: string,
  settingsSnapshot: I_faUserSettings,
  normalizedSettingKey: keyof I_faUserSettings
): I_appSettingsSettingRenderItem {
  const noteTranslationPath = `dialogs.appSettings.appOptions.${settingKey}.note`
  const noteValue = translate.te(noteTranslationPath) ? translate.t(noteTranslationPath) : undefined

  const leaf: I_appSettingsSettingRenderItem = {
    title: translate.t(`dialogs.appSettings.appOptions.${settingKey}.title`),
    description: translate.t(`dialogs.appSettings.appOptions.${settingKey}.description`),
    value: settingsSnapshot[normalizedSettingKey] as boolean,
    tags: translate.t(`dialogs.appSettings.appOptions.${settingKey}.tags`)
  }

  if (noteValue !== undefined) {
    leaf.note = noteValue
  }

  return leaf
}

function appendOneSnapshotKeyToUnsortedTree (
  translate: T_dialogAppSettingsTranslate,
  unsortedTree: T_appSettingsRenderTree,
  appSettingsOptions: Record<string, T_dialogAppSettingsOptionMetadata>,
  settingsSnapshot: I_faUserSettings,
  settingKey: string
): void {
  if (!Object.hasOwn(appSettingsOptions, settingKey)) {
    return
  }

  const normalizedSettingKey = settingKey as keyof I_faUserSettings
  const settingOption = appSettingsOptions[settingKey]!
  const categoryKey = settingOption.category
  const subCategoryKey = settingOption.subcategory

  if (unsortedTree[categoryKey] === undefined) {
    unsortedTree[categoryKey] = {
      title: translate.t(`dialogs.appSettings.appOptionsCategories.${categoryKey}.title`),
      subCategories: {}
    }
  }

  if (unsortedTree[categoryKey].subCategories[subCategoryKey] === undefined) {
    unsortedTree[categoryKey].subCategories[subCategoryKey] = {
      title: translate.t(`dialogs.appSettings.appOptionsCategories.${categoryKey}.${subCategoryKey}.subtitle`),
      settingsList: {}
    }
  }

  const leaf = buildAppSettingsSettingLeaf(
    translate,
    settingKey,
    settingsSnapshot,
    normalizedSettingKey
  )
  unsortedTree[categoryKey].subCategories[subCategoryKey].settingsList[settingKey] = leaf
}

function sortUnsortedAppSettingsTree (unsortedTree: T_appSettingsRenderTree): T_appSettingsRenderTree {
  const sortedCategoryEntries = Object.entries(unsortedTree).sort(
    ([categoryA, categoryValueA], [categoryB, categoryValueB]) =>
      compareAppSettingsCategoryOrder(
        categoryA,
        categoryB,
        categoryValueA.title,
        categoryValueB.title
      )
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

export function buildAppSettingsRenderTree (
  translate: T_dialogAppSettingsTranslate,
  appSettingsOptions: Record<string, T_dialogAppSettingsOptionMetadata>,
  settingsSnapshot: I_faUserSettings
): T_appSettingsRenderTree {
  const unsortedTree: T_appSettingsRenderTree = {}
  const settingKeys = Object.keys(settingsSnapshot).sort((keyA, keyB) => keyA.localeCompare(keyB))

  for (const settingKey of settingKeys) {
    appendOneSnapshotKeyToUnsortedTree(
      translate,
      unsortedTree,
      appSettingsOptions,
      settingsSnapshot,
      settingKey
    )
  }

  return sortUnsortedAppSettingsTree(unsortedTree)
}
