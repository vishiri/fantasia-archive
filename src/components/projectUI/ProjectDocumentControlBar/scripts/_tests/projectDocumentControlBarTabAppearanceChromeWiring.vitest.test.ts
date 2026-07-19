import { expect, test, vi } from 'vitest'

import * as faDocumentAppearanceChromeStyle from 'app/src/scripts/documentAppearance/functions/faDocumentAppearanceChromeStyle'
import * as resolveFaDocumentStatusLabelColorModule from 'app/src/scripts/documentAppearance/functions/resolveFaDocumentStatusLabelColor'

import {
  resolveProjectDocumentControlBarTabAppearanceChrome,
  resolveProjectDocumentControlBarTabInlineStyle
} from '../projectDocumentControlBarTabAppearanceChromeWiring'

test('Test that resolveProjectDocumentControlBarTabInlineStyle maps colors to tab css variables', () => {
  expect(resolveProjectDocumentControlBarTabInlineStyle({
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#aabbcc'
  })).toEqual({
    '--projectDocumentControlBarTab-backgroundColor': '#112233',
    '--projectDocumentControlBarTab-focusHelperColor': '#112233',
    '--projectDocumentControlBarTab-textColor': '#aabbcc',
    backgroundColor: '#112233'
  })
})

test('Test that resolveProjectDocumentControlBarTabInlineStyle omits root color for text-only appearance', () => {
  expect(resolveProjectDocumentControlBarTabInlineStyle({
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '#aabbcc'
  })).toEqual({
    '--projectDocumentControlBarTab-textColor': '#aabbcc'
  })
  expect(resolveProjectDocumentControlBarTabAppearanceChrome({
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '#aabbcc'
  })).toEqual({
    color: '#aabbcc'
  })
})

test('Test that resolveProjectDocumentControlBarTabInlineStyle returns undefined when colors are empty', () => {
  expect(resolveProjectDocumentControlBarTabInlineStyle({
    documentBackgroundColorDraft: ' ',
    documentTextColorDraft: ''
  })).toBeUndefined()
})

test('Test that resolveProjectDocumentControlBarTabInlineStyle applies minor muted grey without text color', () => {
  expect(resolveProjectDocumentControlBarTabInlineStyle({
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '',
    isMinorDraft: true
  })).toEqual({
    '--projectDocumentControlBarTab-textColor': 'var(--fa-color-text-muted)'
  })
})

test('Test that resolveProjectDocumentControlBarTabInlineStyle maps background-only appearance', () => {
  expect(resolveProjectDocumentControlBarTabInlineStyle({
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: ''
  })).toEqual({
    '--projectDocumentControlBarTab-backgroundColor': '#112233',
    '--projectDocumentControlBarTab-focusHelperColor': '#112233',
    backgroundColor: '#112233'
  })
})

test('Test that resolveProjectDocumentControlBarTabInlineStyle returns undefined for empty chrome objects', () => {
  vi.spyOn(faDocumentAppearanceChromeStyle, 'resolveFaDocumentAppearanceChromeStyle').mockReturnValue({})
  vi.spyOn(resolveFaDocumentStatusLabelColorModule, 'resolveFaDocumentStatusLabelColor').mockReturnValue(undefined)
  expect(resolveProjectDocumentControlBarTabInlineStyle({
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#aabbcc'
  })).toBeUndefined()
  vi.restoreAllMocks()
})
