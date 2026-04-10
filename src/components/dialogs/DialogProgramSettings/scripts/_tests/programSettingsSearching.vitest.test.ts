import { expect, test } from 'vitest'

import type {
  I_programSettingRenderItem,
  T_programSettingsRenderTree
} from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import {
  filterProgramSettingsTreeForSearch,
  normalizeProgramSettingsSearchNeedle,
  programSettingMatchesSearchNeedle
} from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsSearching'

const stubSetting = (overrides: Partial<I_programSettingRenderItem> = {}): I_programSettingRenderItem => ({
  description: '',
  tags: '',
  title: '',
  value: false,
  ...overrides
})

/**
 * normalizeProgramSettingsSearchNeedle
 * Trims and lowercases; null and undefined become empty string.
 */
test('Test that normalizeProgramSettingsSearchNeedle trims and lowercases', () => {
  expect(normalizeProgramSettingsSearchNeedle('  Foo BAR  ')).toBe('foo bar')
})

test('Test that normalizeProgramSettingsSearchNeedle maps nullish to empty', () => {
  expect(normalizeProgramSettingsSearchNeedle(null)).toBe('')
  expect(normalizeProgramSettingsSearchNeedle(undefined)).toBe('')
})

/**
 * programSettingMatchesSearchNeedle
 * Empty needle matches any setting.
 */
test('Test that programSettingMatchesSearchNeedle is true when needle is empty', () => {
  const setting = stubSetting({
    description: 'x',
    tags: 'y',
    title: 'z'
  })

  expect(programSettingMatchesSearchNeedle(setting, '')).toBe(true)
})

test('Test that programSettingMatchesSearchNeedle matches title', () => {
  const setting = stubSetting({
    description: 'no',
    tags: 'no',
    title: 'Hello World'
  })

  expect(programSettingMatchesSearchNeedle(setting, 'world')).toBe(true)
  expect(programSettingMatchesSearchNeedle(setting, 'missing')).toBe(false)
})

test('Test that programSettingMatchesSearchNeedle matches tags', () => {
  const setting = stubSetting({
    description: 'no',
    tags: 'alpha,BETA',
    title: 'no'
  })

  expect(programSettingMatchesSearchNeedle(setting, 'beta')).toBe(true)
})

test('Test that programSettingMatchesSearchNeedle matches description', () => {
  const setting = stubSetting({
    description: 'ToolTip BODY text',
    tags: 'no',
    title: 'no'
  })

  expect(programSettingMatchesSearchNeedle(setting, 'body')).toBe(true)
})

test('Test that programSettingMatchesSearchNeedle is case-insensitive', () => {
  const setting = stubSetting({
    description: 'No',
    tags: 'No',
    title: 'CamelCase'
  })

  expect(programSettingMatchesSearchNeedle(setting, 'camel')).toBe(true)
})

/**
 * filterProgramSettingsTreeForSearch
 * Empty normalized query returns a deep clone with all leaves preserved.
 */
test('Test that filterProgramSettingsTreeForSearch with empty query clones full tree', () => {
  const tree: T_programSettingsRenderTree = {
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

  const out = filterProgramSettingsTreeForSearch(tree, '   ')

  expect(out).toEqual(tree)
  expect(out).not.toBe(tree)
  expect(out.cat).not.toBe(tree.cat)
  expect(out.cat.subCategories.sub).not.toBe(tree.cat.subCategories.sub)
})

test('Test that filterProgramSettingsTreeForSearch keeps only matching settings', () => {
  const tree: T_programSettingsRenderTree = {
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

  const out = filterProgramSettingsTreeForSearch(tree, 'findme')

  expect(Object.keys(out.cat.subCategories.sub.settingsList)).toEqual(['keep'])
})

test('Test that filterProgramSettingsTreeForSearch omits empty sub-categories and categories', () => {
  const tree: T_programSettingsRenderTree = {
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

  const out = filterProgramSettingsTreeForSearch(tree, 'needle')

  expect(out.emptyCat).toBeUndefined()
  expect(out.hasMatch).toBeDefined()
  expect(Object.keys(out)).toEqual(['hasMatch'])
})

test('Test that filterProgramSettingsTreeForSearch preserves category and sub-category order', () => {
  const tree: T_programSettingsRenderTree = {
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

  const out = filterProgramSettingsTreeForSearch(tree, 'hit')

  expect(Object.keys(out)).toEqual(['z', 'y'])
  expect(Object.keys(out.z.subCategories)).toEqual(['b', 'a'])
})
