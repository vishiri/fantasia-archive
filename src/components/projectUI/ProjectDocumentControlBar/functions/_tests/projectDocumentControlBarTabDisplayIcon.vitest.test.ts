import { expect, test } from 'vitest'

import {
  PROJECT_DOCUMENT_CONTROL_BAR_CATEGORY_TAB_ICON,
  resolveProjectDocumentControlBarTabDisplayIcon
} from '../projectDocumentControlBarTabDisplayIcon'

/**
 * resolveProjectDocumentControlBarTabDisplayIcon uses the category folder glyph when draft is on.
 */
test('Test that resolveProjectDocumentControlBarTabDisplayIcon returns folder icon for category draft', () => {
  expect(resolveProjectDocumentControlBarTabDisplayIcon({
    isCategoryDraft: true,
    templateIcon: 'mdi-account'
  })).toBe(PROJECT_DOCUMENT_CONTROL_BAR_CATEGORY_TAB_ICON)
})

/**
 * resolveProjectDocumentControlBarTabDisplayIcon keeps the template icon when draft is off.
 */
test('Test that resolveProjectDocumentControlBarTabDisplayIcon returns template icon when not category', () => {
  expect(resolveProjectDocumentControlBarTabDisplayIcon({
    isCategoryDraft: false,
    templateIcon: 'mdi-skull'
  })).toBe('mdi-skull')
})
