import { expect, test } from 'vitest'

import type { I_appMenuItem } from 'app/types/I_appMenusDataList'

import { appControlShouldShowSeparatorAltBeforeItem } from '../functions/appControlSingleMenuSeparatorAlt'

/**
 * Narrow menu rows for divider coverage only.
 */
const item = (label: string): I_appMenuItem => {
  const row = {
    conditions: true,
    icon: 'mdi-numeric-1',
    mode: 'item' as const,
    text: label
  }
  return row
}

test('Test separator alt skips when menu item list binding is absent', () => {
  expect(appControlShouldShowSeparatorAltBeforeItem(undefined, 1)).toBe(false)
})

test('Test separator alt skips on first rows and separator-leading rows only', () => {
  expect(appControlShouldShowSeparatorAltBeforeItem([item('a'), item('b')], 0)).toBe(false)

  expect(appControlShouldShowSeparatorAltBeforeItem([item('a'), item('b')], 1)).toBe(true)

  expect(
    appControlShouldShowSeparatorAltBeforeItem(
      [item('a'), { mode: 'separator' }, item('b'), item('c')],
      2
    )
  ).toBe(false)
})
