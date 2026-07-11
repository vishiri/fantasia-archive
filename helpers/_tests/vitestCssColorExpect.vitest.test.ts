import { expect, test } from 'vitest'

import {
  expectCssColorValue,
  expectInlineStyleColor,
  normalizeCssColorToLowerHex
} from '../vitestCssColorExpect'

test('Test that normalizeCssColorToLowerHex accepts hex and rgb inputs', () => {
  expect(normalizeCssColorToLowerHex('#AABBCC')).toBe('#aabbcc')
  expect(normalizeCssColorToLowerHex('rgb(17, 34, 51)')).toBe('#112233')
})

test('Test that normalizeCssColorToLowerHex throws for unrecognized color strings', () => {
  expect(() => normalizeCssColorToLowerHex('not-a-color')).toThrow('Unrecognized CSS color: not-a-color')
})

test('Test that expectInlineStyleColor compares rgb and hex style attribute values', () => {
  expectInlineStyleColor('background-color: rgb(255, 0, 0);', 'background-color', '#ff0000')
  expectCssColorValue('#ff0000', '#FF0000')
})
