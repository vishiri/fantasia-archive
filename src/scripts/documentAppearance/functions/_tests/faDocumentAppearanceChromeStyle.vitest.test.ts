import { expect, test } from 'vitest'

import {
  resolveFaDocumentAppearanceChromeStyle,
  resolveFaDocumentAppearanceHasCustomChromeStyle
} from '../faDocumentAppearanceChromeStyle'

test('Test that resolveFaDocumentAppearanceChromeStyle maps non-empty colors to inline style', () => {
  expect(resolveFaDocumentAppearanceChromeStyle({
    documentBackgroundColor: '#112233',
    documentTextColor: '#aabbcc'
  })).toEqual({
    backgroundColor: '#112233',
    color: '#aabbcc'
  })
})

test('Test that resolveFaDocumentAppearanceChromeStyle returns undefined when colors are empty', () => {
  expect(resolveFaDocumentAppearanceChromeStyle({
    documentBackgroundColor: '   ',
    documentTextColor: ''
  })).toBeUndefined()
  expect(resolveFaDocumentAppearanceHasCustomChromeStyle(undefined)).toBe(false)
})
