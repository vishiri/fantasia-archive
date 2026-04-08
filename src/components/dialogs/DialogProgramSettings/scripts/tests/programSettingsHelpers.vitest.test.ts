import { expect, test } from 'vitest'

import type {
  I_programCategoryRenderItem,
  I_programSubCategoryRenderItem
} from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import {
  showNonLastSeparator,
  showNonLastTopCategorySeparator
} from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsHelpers'

const stubSubCategory = (): I_programSubCategoryRenderItem => ({
  settingsList: {},
  title: ''
})

const stubCategory = (): I_programCategoryRenderItem => ({
  subCategories: {},
  title: ''
})

/**
 * showNonLastSeparator
 * Returns false when there is only one sub-category (index zero is last).
 */
test('Test that showNonLastSeparator is false for the sole sub-category', () => {
  const subCategories: Record<string, I_programSubCategoryRenderItem> = {
    a: stubSubCategory()
  }

  expect(showNonLastSeparator(subCategories, 0)).toBe(false)
})

/**
 * showNonLastSeparator
 * Returns true before the last sub-category and false on the last index.
 */
test('Test that showNonLastSeparator is true only before the final sub-category', () => {
  const subCategories: Record<string, I_programSubCategoryRenderItem> = {
    a: stubSubCategory(),
    b: stubSubCategory()
  }

  expect(showNonLastSeparator(subCategories, 0)).toBe(true)
  expect(showNonLastSeparator(subCategories, 1)).toBe(false)
})

/**
 * showNonLastSeparator
 * Empty sub-category map yields false for index zero.
 */
test('Test that showNonLastSeparator is false for an empty sub-category record', () => {
  expect(showNonLastSeparator({}, 0)).toBe(false)
})

/**
 * showNonLastTopCategorySeparator
 * Returns false when the tree has a single top-level category.
 */
test('Test that showNonLastTopCategorySeparator is false for a single top-level category', () => {
  const tree: Record<string, I_programCategoryRenderItem> = {
    cat: stubCategory()
  }

  expect(showNonLastTopCategorySeparator(tree, 0)).toBe(false)
})

/**
 * showNonLastTopCategorySeparator
 * Returns true before the last category and false on the last index.
 */
test('Test that showNonLastTopCategorySeparator is true only before the final top-level category', () => {
  const tree: Record<string, I_programCategoryRenderItem> = {
    a: stubCategory(),
    b: stubCategory()
  }

  expect(showNonLastTopCategorySeparator(tree, 0)).toBe(true)
  expect(showNonLastTopCategorySeparator(tree, 1)).toBe(false)
})

/**
 * showNonLastTopCategorySeparator
 * Empty tree yields false for index zero.
 */
test('Test that showNonLastTopCategorySeparator is false for an empty tree', () => {
  expect(showNonLastTopCategorySeparator({}, 0)).toBe(false)
})
