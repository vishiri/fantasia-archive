import { PROGRAM_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogProgramSettings/_data/programSettingsOptions'
import type {
  I_programSubCategoryRenderItem,
  T_programSettingsRenderTree
} from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import {
  compareProgramSettingsCategoryOrder,
  sortSettingsListByTranslatedTitle,
  toSortedRecord
} from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsTreeSorting'
import programSettingsMessages from 'app/src/i18n/en-US/dialogs/T_programSettings'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/faUserSettingsDefaults'
import type { I_faUserSettings } from 'app/types/I_faUserSettings'

type T_programSettingOptionBlock = {
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
 * Builds the ordered program settings tree from en-US T_programSettings and FA_USER_SETTINGS_DEFAULTS, matching buildProgramSettingsRenderTree (category rank, alphabetical keys, title sort within subcategories).
 *
 * - Dialog strings come from dialogs.programSettings, not globalFunctionality.T_faUserSettings.
 */
export function buildExpectedProgramSettingsTreeFromEnUsMessages (): T_programSettingsRenderTree {
  const cats = programSettingsMessages.appOptionsCategories
  const appOpts = programSettingsMessages.appOptions as Record<string, T_programSettingOptionBlock>
  const unsortedTree: T_programSettingsRenderTree = {}
  const settingKeys = Object.keys(FA_USER_SETTINGS_DEFAULTS).sort((keyA, keyB) =>
    keyA.localeCompare(keyB)
  ) as (keyof I_faUserSettings)[]

  for (const settingKey of settingKeys) {
    const meta = PROGRAM_SETTINGS_OPTIONS[settingKey]
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
