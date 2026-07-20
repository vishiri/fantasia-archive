import { expect, test, vi } from 'vitest'

import * as faDocumentAppearanceChromeStyle from 'app/src/scripts/documentAppearance/functions/faDocumentAppearanceChromeStyle'
import * as resolveFaDocumentStatusLabelColorModule from 'app/src/scripts/documentAppearance/functions/resolveFaDocumentStatusLabelColor'

import {
  resolveProjectAppControlBarTabAppearanceChrome,
  resolveProjectAppControlBarTabInlineStyle
} from '../projectAppControlBarTabAppearanceChromeWiring'

test('Test that resolveProjectAppControlBarTabInlineStyle maps colors to tab css variables', () => {
  expect(resolveProjectAppControlBarTabInlineStyle({
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#aabbcc'
  })).toEqual({
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

test('Test that resolveProjectAppControlBarTabInlineStyle applies minor muted grey without text color', () => {
  expect(resolveProjectAppControlBarTabInlineStyle({
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '',
    isMinorDraft: true
  })).toEqual({
    '--projectAppControlBarTab-textColor': 'var(--fa-color-text-muted)'
  })
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
})

test('Test that resolveProjectAppControlBarTabInlineStyle returns undefined for empty chrome objects', () => {
  vi.spyOn(faDocumentAppearanceChromeStyle, 'resolveFaDocumentAppearanceChromeStyle').mockReturnValue({})
  vi.spyOn(resolveFaDocumentStatusLabelColorModule, 'resolveFaDocumentStatusLabelColor').mockReturnValue(undefined)
  expect(resolveProjectAppControlBarTabInlineStyle({
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#aabbcc'
  })).toBeUndefined()
  vi.restoreAllMocks()
})
