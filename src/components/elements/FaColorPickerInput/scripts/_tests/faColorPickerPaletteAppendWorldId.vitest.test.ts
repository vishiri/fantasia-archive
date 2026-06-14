import { expect, test } from 'vitest'

import { readFaColorPickerPaletteAppendWorldId } from '../functions/faColorPickerPaletteAppendWorldId'

/**
 * readFaColorPickerPaletteAppendWorldId
 * Returns an empty string when worldId is undefined.
 */
test('Test that readFaColorPickerPaletteAppendWorldId returns empty for undefined', () => {
  expect(readFaColorPickerPaletteAppendWorldId(undefined)).toBe('')
})

/**
 * readFaColorPickerPaletteAppendWorldId
 * Trims a provided world id string.
 */
test('Test that readFaColorPickerPaletteAppendWorldId trims world ids', () => {
  expect(readFaColorPickerPaletteAppendWorldId(' world-1 ')).toBe('world-1')
})
