import type { I_appSettingsSelectOption } from 'app/types/I_dialogAppSettings'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type {
  I_appSettingsSettingRenderItem,
  I_appSettingsSubCategoryRenderItem,
  T_appSettingsRenderTree,
  T_dialogAppSettingsOptionMetadata,
  T_dialogAppSettingsTranslate
} from 'app/types/I_dialogAppSettings'

const APP_THEME_SETTING_KEY = 'appTheme'

/**
 * Vertical tab order for Fantasia Archive Settings.
 * Unknown keys sort after this list, by title (or key when title empty).
 */
const APP_SETTINGS_CATEGORY_TAB_ORDER = [
  'visualAccessibility',
  'hierarchicalTree',
  'popupsFloatingWindows',
  'documentViewEdit',
  'projectOverview',
  'welcomeScreen',
  'accessibility',
  'developerSettings'
] as const

function appSettingsCategorySortLabel (categoryKey: string, categoryTitle: string): string {
  if (categoryTitle !== '') {
    return categoryTitle
  }
  return categoryKey
}

function appSettingsCategoryTabRank (categoryKey: string): number {
  const index = (APP_SETTINGS_CATEGORY_TAB_ORDER as readonly string[]).indexOf(categoryKey)
  if (index === -1) {
    return APP_SETTINGS_CATEGORY_TAB_ORDER.length
  }
  return index
}

/**
 * Tab order: Visuals, Tree, Popups, Pages (Document / Overview / Welcome), Accessibility,
 * then developerSettings last. Unknown category keys sort after known ones by title.
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

  const rankA = appSettingsCategoryTabRank(categoryA)
  const rankB = appSettingsCategoryTabRank(categoryB)
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

function buildAppSettingsSelectOptions (
  translate: T_dialogAppSettingsTranslate,
  settingKey: string,
  appThemeValues: readonly string[]
): I_appSettingsSelectOption[] {
  if (settingKey !== APP_THEME_SETTING_KEY) {
    return []
  }

  return appThemeValues.map((themeValue) => {
    return {
      label: translate.t(`dialogs.appSettings.appOptions.${settingKey}.values.${themeValue}`),
      value: themeValue
    }
  })
}

function buildAppSettingsSettingLeaf (
  translate: T_dialogAppSettingsTranslate,
  settingKey: string,
  settingsSnapshot: I_faUserSettings,
  normalizedSettingKey: keyof I_faUserSettings,
  appThemeValues: readonly string[]
): I_appSettingsSettingRenderItem {
  const noteTranslationPath = `dialogs.appSettings.appOptions.${settingKey}.note`
  const noteValue = translate.te(noteTranslationPath) ? translate.t(noteTranslationPath) : undefined
  const title = translate.t(`dialogs.appSettings.appOptions.${settingKey}.title`)
  const description = translate.t(`dialogs.appSettings.appOptions.${settingKey}.description`)
  const tags = translate.t(`dialogs.appSettings.appOptions.${settingKey}.tags`)

  if (settingKey === APP_THEME_SETTING_KEY) {
    const leaf: I_appSettingsSettingRenderItem = {
      title,
      description,
      tags,
      control: 'select',
      value: String(settingsSnapshot[normalizedSettingKey]),
      options: buildAppSettingsSelectOptions(translate, settingKey, appThemeValues)
    }
    if (noteValue !== undefined) {
      leaf.note = noteValue
    }
    return leaf
  }

  const leaf: I_appSettingsSettingRenderItem = {
    title,
    description,
    tags,
    control: 'toggle',
    value: settingsSnapshot[normalizedSettingKey] as boolean
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
  settingKey: string,
  appThemeValues: readonly string[]
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
    normalizedSettingKey,
    appThemeValues
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
  settingsSnapshot: I_faUserSettings,
  appThemeValues: readonly string[]
): T_appSettingsRenderTree {
  const unsortedTree: T_appSettingsRenderTree = {}
  const settingKeys = Object.keys(settingsSnapshot).sort((keyA, keyB) => keyA.localeCompare(keyB))

  for (const settingKey of settingKeys) {
    appendOneSnapshotKeyToUnsortedTree(
      translate,
      unsortedTree,
      appSettingsOptions,
      settingsSnapshot,
      settingKey,
      appThemeValues
    )
  }

  return sortUnsortedAppSettingsTree(unsortedTree)
}
