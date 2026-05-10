import { ref, type Ref } from 'vue'
import { expect, test } from 'vitest'

import type {
  I_appSettingsCategoryRenderItem,
  I_appSettingsSettingRenderItem,
  I_appSettingsSubCategoryRenderItem,
  T_appSettingsRenderTree
} from 'app/types/I_dialogAppSettings'
import {
  filterAppSettingsTreeForSearch,
  normalizeAppSettingsSearchNeedle,
  appSettingsRowMatchesSearchNeedle,
  showNonLastSeparator,
  showNonLastTopCategorySeparator,
  useDialogAppSettingsSearchComputed
} from 'app/src/components/dialogs/DialogAppSettings/scripts/dialogAppSettingsSearch'

const stubSetting = (overrides: Partial<I_appSettingsSettingRenderItem> = {}): I_appSettingsSettingRenderItem => ({
  description: '',
  tags: '',
  title: '',
  value: false,
  ...overrides
})

const stubSubCategory = (): I_appSettingsSubCategoryRenderItem => ({
  settingsList: {},
  title: ''
})

const stubCategory = (): I_appSettingsCategoryRenderItem => ({
  subCategories: {},
  title: ''
})

/**
 * normalizeAppSettingsSearchNeedle
 * Trims and lowercases; null and undefined become empty string.
 */
test('Test that normalizeAppSettingsSearchNeedle trims and lowercases', () => {
  expect(normalizeAppSettingsSearchNeedle('  Foo BAR  ')).toBe('foo bar')
})

test('Test that normalizeAppSettingsSearchNeedle maps nullish to empty', () => {
  expect(normalizeAppSettingsSearchNeedle(null)).toBe('')
  expect(normalizeAppSettingsSearchNeedle(undefined)).toBe('')
})

/**
 * appSettingsRowMatchesSearchNeedle
 * Empty needle matches any setting.
 */
test('Test that appSettingsRowMatchesSearchNeedle is true when needle is empty', () => {
  const setting = stubSetting({
    description: 'x',
    tags: 'y',
    title: 'z'
  })

  expect(appSettingsRowMatchesSearchNeedle(setting, '')).toBe(true)
})

test('Test that appSettingsRowMatchesSearchNeedle matches title', () => {
  const setting = stubSetting({
    description: 'no',
    tags: 'no',
    title: 'Hello World'
  })

  expect(appSettingsRowMatchesSearchNeedle(setting, 'world')).toBe(true)
  expect(appSettingsRowMatchesSearchNeedle(setting, 'missing')).toBe(false)
})

test('Test that appSettingsRowMatchesSearchNeedle matches tags', () => {
  const setting = stubSetting({
    description: 'no',
    tags: 'alpha,BETA',
    title: 'no'
  })

  expect(appSettingsRowMatchesSearchNeedle(setting, 'beta')).toBe(true)
})

test('Test that appSettingsRowMatchesSearchNeedle matches description', () => {
  const setting = stubSetting({
    description: 'ToolTip BODY text',
    tags: 'no',
    title: 'no'
  })

  expect(appSettingsRowMatchesSearchNeedle(setting, 'body')).toBe(true)
})

test('Test that appSettingsRowMatchesSearchNeedle is case-insensitive', () => {
  const setting = stubSetting({
    description: 'No',
    tags: 'No',
    title: 'CamelCase'
  })

  expect(appSettingsRowMatchesSearchNeedle(setting, 'camel')).toBe(true)
})

/**
 * filterAppSettingsTreeForSearch
 * Empty normalized query returns a deep clone with all leaves preserved.
 */
test('Test that filterAppSettingsTreeForSearch with empty query clones full tree', () => {
  const tree: T_appSettingsRenderTree = {
    cat: {
      subCategories: {
        sub: {
          settingsList: {
            a: stubSetting({
              description: 'd',
              tags: 't',
              title: 'T'
            })
          },
          title: 'Sub'
        }
      },
      title: 'Cat'
    }
  }

  const out = filterAppSettingsTreeForSearch(tree, '   ')

  expect(out).toEqual(tree)
  expect(out).not.toBe(tree)
  expect(out.cat).not.toBe(tree.cat)
  expect(out.cat.subCategories.sub).not.toBe(tree.cat.subCategories.sub)
})

test('Test that filterAppSettingsTreeForSearch keeps only matching settings', () => {
  const tree: T_appSettingsRenderTree = {
    cat: {
      subCategories: {
        sub: {
          settingsList: {
            keep: stubSetting({
              description: '',
              tags: '',
              title: 'findme',
              value: true
            }),
            drop: stubSetting({
              description: 'other',
              tags: 'x',
              title: 'y',
              value: false
            })
          },
          title: 'Sub'
        }
      },
      title: 'Cat'
    }
  }

  const out = filterAppSettingsTreeForSearch(tree, 'findme')

  expect(Object.keys(out.cat.subCategories.sub.settingsList)).toEqual(['keep'])
})

test('Test that filterAppSettingsTreeForSearch omits empty sub-categories and categories', () => {
  const tree: T_appSettingsRenderTree = {
    emptyCat: {
      subCategories: {
        emptySub: {
          settingsList: {
            only: stubSetting({
              description: 'nope',
              tags: 'nope',
              title: 'nope',
              value: false
            })
          },
          title: 'E'
        }
      },
      title: 'EC'
    },
    hasMatch: {
      subCategories: {
        sub: {
          settingsList: {
            ok: stubSetting({
              description: '',
              tags: '',
              title: 'needle-here',
              value: true
            })
          },
          title: 'S'
        }
      },
      title: 'H'
    }
  }

  const out = filterAppSettingsTreeForSearch(tree, 'needle')

  expect(out.emptyCat).toBeUndefined()
  expect(out.hasMatch).toBeDefined()
  expect(Object.keys(out)).toEqual(['hasMatch'])
})

test('Test that filterAppSettingsTreeForSearch preserves category and sub-category order', () => {
  const tree: T_appSettingsRenderTree = {
    z: {
      subCategories: {
        b: {
          settingsList: {
            s2: stubSetting({
              description: '',
              tags: 'hit',
              title: '',
              value: false
            })
          },
          title: 'B'
        },
        a: {
          settingsList: {
            s1: stubSetting({
              description: '',
              tags: 'hit',
              title: '',
              value: false
            })
          },
          title: 'A'
        }
      },
      title: 'Z'
    },
    y: {
      subCategories: {
        c: {
          settingsList: {
            s3: stubSetting({
              description: '',
              tags: '',
              title: 'hit',
              value: false
            })
          },
          title: 'C'
        }
      },
      title: 'Y'
    }
  }

  const out = filterAppSettingsTreeForSearch(tree, 'hit')

  expect(Object.keys(out)).toEqual(['z', 'y'])
  expect(Object.keys(out.z.subCategories)).toEqual(['b', 'a'])
})

/**
 * useDialogAppSettingsSearchComputed
 * Emits an empty filtered tree until the search field has non-whitespace text.
 */
test('search filtered tree stays empty when search query is blank', () => {
  const appSettingsTree = ref<T_appSettingsRenderTree>({
    cat: {
      subCategories: {},
      title: 'Cat'
    }
  })
  const searchSettingsQuery = ref<string | null>('   ')

  const c = useDialogAppSettingsSearchComputed({
    appSettingsTree,
    searchSettingsQuery
  })

  expect(c.hasActiveSearchQuery.value).toBe(false)
  expect(c.searchFilteredAppSettingsTree.value).toEqual({})
  expect(c.hasSearchNoMatchingSettings.value).toBe(false)
})

/**
 * useDialogAppSettingsSearchComputed
 * Marks no-results when search is active and the filtered tree has no categories.
 */
test('hasSearchNoMatchingSettings is true when filter yields empty tree', () => {
  const appSettingsTree = ref<T_appSettingsRenderTree>({
    cat: {
      subCategories: {
        sub: {
          settingsList: {
            onlyKey: {
              description: 'd',
              tags: 't',
              title: 'UniqueTitle',
              value: false
            }
          },
          title: 'Sub'
        }
      },
      title: 'Cat'
    }
  })
  const searchSettingsQuery = ref<string | null>('zzznomatchzzz')

  const c = useDialogAppSettingsSearchComputed({
    appSettingsTree,
    searchSettingsQuery
  })

  expect(c.hasActiveSearchQuery.value).toBe(true)
  expect(Object.keys(c.searchFilteredAppSettingsTree.value).length).toBe(0)
  expect(c.hasSearchNoMatchingSettings.value).toBe(true)
})

/**
 * useDialogAppSettingsSearchComputed
 * hasSearchNoMatchingSettings is false when the active query still matches at least one category.
 */
test('hasActiveSearchQuery treats undefined search query like nullish empty input', () => {
  const appSettingsTree = ref<T_appSettingsRenderTree>({
    cat: {
      subCategories: {},
      title: 'Cat'
    }
  })
  const searchSettingsQuery = ref<string | null | undefined>(undefined)

  const c = useDialogAppSettingsSearchComputed({
    appSettingsTree,
    searchSettingsQuery: searchSettingsQuery as Ref<string | null>
  })

  expect(c.hasActiveSearchQuery.value).toBe(false)
})

test('hasSearchNoMatchingSettings is false when filtered tree is non-empty', () => {
  const appSettingsTree = ref<T_appSettingsRenderTree>({
    cat: {
      subCategories: {
        sub: {
          settingsList: {
            onlyKey: {
              description: 'd',
              tags: 't',
              title: 'UniqueTitle',
              value: false
            }
          },
          title: 'Sub'
        }
      },
      title: 'Cat'
    }
  })
  const searchSettingsQuery = ref<string | null>('Unique')

  const c = useDialogAppSettingsSearchComputed({
    appSettingsTree,
    searchSettingsQuery
  })

  expect(c.hasActiveSearchQuery.value).toBe(true)
  expect(Object.keys(c.searchFilteredAppSettingsTree.value).length).toBeGreaterThan(0)
  expect(c.hasSearchNoMatchingSettings.value).toBe(false)
})

/**
 * showNonLastSeparator
 * Returns false when there is only one sub-category (index zero is last).
 */
test('Test that showNonLastSeparator is false for the sole sub-category', () => {
  const subCategories: Record<string, I_appSettingsSubCategoryRenderItem> = {
    a: stubSubCategory()
  }

  expect(showNonLastSeparator(subCategories, 0)).toBe(false)
})

/**
 * showNonLastSeparator
 * Returns true before the last sub-category and false on the last index.
 */
test('Test that showNonLastSeparator is true only before the final sub-category', () => {
  const subCategories: Record<string, I_appSettingsSubCategoryRenderItem> = {
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
  const tree: Record<string, I_appSettingsCategoryRenderItem> = {
    cat: stubCategory()
  }

  expect(showNonLastTopCategorySeparator(tree, 0)).toBe(false)
})

/**
 * showNonLastTopCategorySeparator
 * Returns true before the last category and false on the last index.
 */
test('Test that showNonLastTopCategorySeparator is true only before the final top-level category', () => {
  const tree: Record<string, I_appSettingsCategoryRenderItem> = {
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
