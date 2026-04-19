import { expect, test, vi } from 'vitest'

import { faMenuItem, faMenuSeparator, faMenuSubItem, faMenuSubSeparator } from '../_data/menuDataHelpers'

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: {
    global: {
      t: (key: string): string => `mocked:${key}`
    }
  }
}))

/**
 * menuDataHelpers
 * faMenuSeparator returns a separator row for top-level menus.
 */
test('Test that faMenuSeparator returns separator mode', () => {
  expect(faMenuSeparator()).toEqual({ mode: 'separator' })
})

/**
 * menuDataHelpers
 * faMenuSubSeparator returns a separator row for submenu lists.
 */
test('Test that faMenuSubSeparator returns separator mode', () => {
  expect(faMenuSubSeparator()).toEqual({ mode: 'separator' })
})

/**
 * menuDataHelpers
 * faMenuItem without patch returns the base item shape with translated text.
 */
test('Test that faMenuItem without patch uses base shape only', () => {
  const row = faMenuItem('menus.foo', 'mdi-home')
  expect(row).toEqual({
    conditions: true,
    icon: 'mdi-home',
    mode: 'item',
    specialColor: undefined,
    submenu: undefined,
    text: 'mocked:menus.foo',
    trigger: undefined,
    triggerArguments: undefined
  })
})

/**
 * menuDataHelpers
 * faMenuItem with patch merges overrides onto the base item.
 */
test('Test that faMenuItem with patch merges partial fields', () => {
  const row = faMenuItem('menus.bar', 'mdi-star', { icon: 'mdi-bell' })
  expect(row.icon).toBe('mdi-bell')
  expect(row.text).toBe('mocked:menus.bar')
  expect(row.mode).toBe('item')
})

/**
 * menuDataHelpers
 * faMenuSubItem without patch returns the base sub-item shape with translated text.
 */
test('Test that faMenuSubItem without patch uses base shape only', () => {
  const row = faMenuSubItem('menus.baz', 'mdi-cog')
  expect(row).toEqual({
    conditions: true,
    icon: 'mdi-cog',
    mode: 'item',
    specialColor: undefined,
    text: 'mocked:menus.baz',
    trigger: undefined,
    triggerArguments: undefined
  })
})

/**
 * menuDataHelpers
 * faMenuSubItem with patch merges overrides onto the base sub-item.
 */
test('Test that faMenuSubItem with patch merges partial fields', () => {
  const row = faMenuSubItem('menus.qux', 'mdi-pin', { conditions: false })
  expect(row.conditions).toBe(false)
  expect(row.text).toBe('mocked:menus.qux')
  expect(row.icon).toBe('mdi-pin')
})
