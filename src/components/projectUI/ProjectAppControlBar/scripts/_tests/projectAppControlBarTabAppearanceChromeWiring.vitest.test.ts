import { expect, test, vi } from 'vitest'

import * as documentAppearanceManager from 'app/src/scripts/documentAppearance/documentAppearance_manager'
import {
  FA_COLOR_GLYPH_HIGHLIGHT_BASE_DEFAULT,
  FA_COLOR_GLYPH_HIGHLIGHT_BASE_MILD
} from 'app/types/I_faColorContrast'

import {
  resolveProjectAppControlBarTabAppearanceChrome,
  resolveProjectAppControlBarTabHasUserCustomTextColor,
  resolveProjectAppControlBarTabInlineStyle,
  resolveProjectAppControlBarTabShowsStatusMuted
} from '../projectAppControlBarTabAppearanceChromeWiring'

test('Test that resolveProjectAppControlBarTabInlineStyle maps colors to tab css variables', () => {
  expect(resolveProjectAppControlBarTabInlineStyle({
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#aabbcc'
  })).toEqual({
    '--fa-color-glyph-base': '#aabbcc',
    '--fa-color-glyph-highlight-base': FA_COLOR_GLYPH_HIGHLIGHT_BASE_DEFAULT,
    '--projectAppControlBarTab-backgroundColor': '#112233',
    '--projectAppControlBarTab-focusHelperColor': '#112233',
    '--projectAppControlBarTab-textColor': '#aabbcc',
    backgroundColor: '#112233'
  })
})

test('Test that resolveProjectAppControlBarTabInlineStyle omits root color for text-only appearance', () => {
  expect(resolveProjectAppControlBarTabInlineStyle({
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '#aabbcc'
  })).toEqual({
    '--fa-color-glyph-base': '#aabbcc',
    '--fa-color-glyph-highlight-base': FA_COLOR_GLYPH_HIGHLIGHT_BASE_DEFAULT,
    '--projectAppControlBarTab-textColor': '#aabbcc'
  })
  expect(resolveProjectAppControlBarTabAppearanceChrome({
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '#aabbcc'
  })).toEqual({
    color: '#aabbcc'
  })
})

test('Test that resolveProjectAppControlBarTabInlineStyle returns undefined when colors are empty', () => {
  expect(resolveProjectAppControlBarTabInlineStyle({
    documentBackgroundColorDraft: ' ',
    documentTextColorDraft: ''
  })).toBeUndefined()
})

test('Test that minor without custom text color uses statusMuted class helpers not inline chrome', () => {
  const minorTab = {
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '',
    isMinorDraft: true
  }
  expect(resolveProjectAppControlBarTabAppearanceChrome(minorTab)).toBeUndefined()
  expect(resolveProjectAppControlBarTabInlineStyle(minorTab)).toBeUndefined()
  expect(resolveProjectAppControlBarTabHasUserCustomTextColor(minorTab)).toBe(false)
  expect(resolveProjectAppControlBarTabShowsStatusMuted(minorTab)).toBe(true)
})

test('Test that minor with custom text color is customAppearance not statusMuted', () => {
  const minorColoredTab = {
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '#aabbcc',
    isMinorDraft: true
  }
  expect(resolveProjectAppControlBarTabHasUserCustomTextColor(minorColoredTab)).toBe(true)
  expect(resolveProjectAppControlBarTabShowsStatusMuted(minorColoredTab)).toBe(false)
})

test('Test that resolveProjectAppControlBarTabInlineStyle maps background-only appearance', () => {
  expect(resolveProjectAppControlBarTabInlineStyle({
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: ''
  })).toEqual({
    '--projectAppControlBarTab-backgroundColor': '#112233',
    '--projectAppControlBarTab-focusHelperColor': '#112233',
    backgroundColor: '#112233'
  })
  expect(resolveProjectAppControlBarTabHasUserCustomTextColor({
    documentTextColorDraft: ''
  })).toBe(false)
})

test('Test that resolveProjectAppControlBarTabInlineStyle uses mild glyph highlight for dark text colors', () => {
  expect(resolveProjectAppControlBarTabInlineStyle({
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '#ad3131'
  })).toEqual({
    '--fa-color-glyph-base': '#ad3131',
    '--fa-color-glyph-highlight-base': FA_COLOR_GLYPH_HIGHLIGHT_BASE_MILD,
    '--projectAppControlBarTab-textColor': '#ad3131'
  })
})

test('Test that resolveProjectAppControlBarTabInlineStyle returns undefined for empty chrome objects', () => {
  vi.spyOn(documentAppearanceManager, 'resolveFaDocumentAppearanceChromeStyle').mockReturnValue({})
  expect(resolveProjectAppControlBarTabInlineStyle({
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#aabbcc'
  })).toBeUndefined()
  vi.restoreAllMocks()
})
