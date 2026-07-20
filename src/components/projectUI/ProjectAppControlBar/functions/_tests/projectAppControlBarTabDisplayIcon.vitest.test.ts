import { expect, test } from 'vitest'

import {
  PROJECT_APP_CONTROL_BAR_CATEGORY_TAB_ICON,
  resolveProjectAppControlBarTabDisplayIcon
} from '../projectAppControlBarTabDisplayIcon'

/**
 * resolveProjectAppControlBarTabDisplayIcon uses the category folder glyph when draft is on.
 */
test('Test that resolveProjectAppControlBarTabDisplayIcon returns folder icon for category draft', () => {
  expect(resolveProjectAppControlBarTabDisplayIcon({
    isCategoryDraft: true,
    templateIcon: 'mdi-account'
  })).toBe(PROJECT_APP_CONTROL_BAR_CATEGORY_TAB_ICON)
})

/**
 * resolveProjectAppControlBarTabDisplayIcon keeps the template icon when draft is off.
 */
test('Test that resolveProjectAppControlBarTabDisplayIcon returns template icon when not category', () => {
  expect(resolveProjectAppControlBarTabDisplayIcon({
    isCategoryDraft: false,
    templateIcon: 'mdi-skull'
  })).toBe('mdi-skull')
})
