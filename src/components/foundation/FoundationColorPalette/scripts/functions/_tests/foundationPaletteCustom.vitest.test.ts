import { expect, test } from 'vitest'

import { FOUNDATION_CUSTOM_SWATCHES } from '../foundationPaletteCustom'

test('FOUNDATION_CUSTOM_SWATCHES mirrors QUASAR COLORS - GENERAL entries', () => {
  expect(FOUNDATION_CUSTOM_SWATCHES.length).toBe(13)
  expect(FOUNDATION_CUSTOM_SWATCHES.every((s) => s.sassVar.startsWith('$'))).toBe(true)
  expect(FOUNDATION_CUSTOM_SWATCHES.every((s) => /^#[0-9a-f]{6}$/i.test(s.hex))).toBe(true)

  const info = FOUNDATION_CUSTOM_SWATCHES.find((s) => s.sassVar === '$info')
  expect(info?.note).toBeUndefined()
  expect(info?.hex).toBe('#f7eed9')
})
