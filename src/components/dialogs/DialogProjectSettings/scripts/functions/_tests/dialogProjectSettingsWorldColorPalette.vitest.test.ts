import { expect, test } from 'vitest'

import {
  appendDialogProjectSettingsWorldColorPaletteEntry,
  buildDialogProjectSettingsWorldColorPaletteEntries,
  duplicateDialogProjectSettingsWorldColorPaletteEntryAfter,
  isDialogProjectSettingsWorldColorPaletteSwatchDuplicate,
  readDialogProjectSettingsWorldColorPaletteEntryHexList,
  removeDialogProjectSettingsWorldColorPaletteEntry,
  replaceDialogProjectSettingsWorldColorPaletteEntryHex,
  shouldResyncDialogProjectSettingsWorldColorPaletteFromProp,
  wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength
} from '../dialogProjectSettingsWorldColorPalette'

test('Test that buildDialogProjectSettingsWorldColorPaletteEntries assigns stable hex values with ids', () => {
  let counter = 0
  const entries = buildDialogProjectSettingsWorldColorPaletteEntries(
    ['#112233', '#445566'],
    () => `id-${String(++counter)}`
  )

  expect(entries).toEqual([
    {
      hex: '#112233',
      id: 'id-1'
    },
    {
      hex: '#445566',
      id: 'id-2'
    }
  ])
})

test('Test that appendDialogProjectSettingsWorldColorPaletteEntry appends one swatch row', () => {
  const entries = appendDialogProjectSettingsWorldColorPaletteEntry(
    [{
      hex: '#112233',
      id: 'a'
    }],
    () => 'b',
    '#FFFFFF'
  )

  expect(entries).toEqual([
    {
      hex: '#112233',
      id: 'a'
    },
    {
      hex: '#FFFFFF',
      id: 'b'
    }
  ])
})

test('Test that replaceDialogProjectSettingsWorldColorPaletteEntryHex updates one entry', () => {
  const entries = replaceDialogProjectSettingsWorldColorPaletteEntryHex(
    [{
      hex: '#112233',
      id: 'a'
    }],
    'a',
    '#AABBCC'
  )

  expect(entries[0]?.hex).toBe('#AABBCC')
  expect(replaceDialogProjectSettingsWorldColorPaletteEntryHex(
    [{
      hex: '#112233',
      id: 'a'
    }],
    'missing',
    '#AABBCC'
  )[0]?.hex).toBe('#112233')
})

test('Test that isDialogProjectSettingsWorldColorPaletteSwatchDuplicate matches duplicate keys case-insensitively', () => {
  const duplicateKeys = new Set(['#aabbcc'])
  expect(isDialogProjectSettingsWorldColorPaletteSwatchDuplicate('#AABBCC', duplicateKeys)).toBe(true)
  expect(isDialogProjectSettingsWorldColorPaletteSwatchDuplicate('#112233', duplicateKeys)).toBe(false)
})

test('Test that shouldResyncDialogProjectSettingsWorldColorPaletteFromProp skips unchanged serialized palettes', () => {
  const entries = [{
    hex: '#112233',
    id: 'a'
  }]
  const serialize = (hexList: readonly string[]) => hexList.join(';')
  expect(shouldResyncDialogProjectSettingsWorldColorPaletteFromProp(entries, '#112233', serialize)).toBe(false)
  expect(shouldResyncDialogProjectSettingsWorldColorPaletteFromProp(entries, '#445566', serialize)).toBe(true)
})

test('Test that readDialogProjectSettingsWorldColorPaletteEntryHexList maps entry hex values', () => {
  expect(readDialogProjectSettingsWorldColorPaletteEntryHexList([
    {
      hex: '#112233',
      id: 'a'
    },
    {
      hex: '#445566',
      id: 'b'
    }
  ])).toEqual(['#112233', '#445566'])
})

test('Test that duplicateDialogProjectSettingsWorldColorPaletteEntryAfter inserts a copy after the source row', () => {
  const entries = [{
    hex: '#112233',
    id: 'a'
  }, {
    hex: '#445566',
    id: 'b'
  }]
  const duplicated = duplicateDialogProjectSettingsWorldColorPaletteEntryAfter(entries, 'a', () => 'c')
  expect(duplicated).toEqual([
    {
      hex: '#112233',
      id: 'a'
    },
    {
      hex: '#112233',
      id: 'c'
    },
    {
      hex: '#445566',
      id: 'b'
    }
  ])
  expect(duplicateDialogProjectSettingsWorldColorPaletteEntryAfter(entries, 'missing', () => 'c')).toBeNull()
})

test('Test that removeDialogProjectSettingsWorldColorPaletteEntry drops one swatch row', () => {
  const entries = [{
    hex: '#112233',
    id: 'a'
  }, {
    hex: '#445566',
    id: 'b'
  }]
  expect(removeDialogProjectSettingsWorldColorPaletteEntry(entries, 'a')).toEqual([{
    hex: '#445566',
    id: 'b'
  }])
  expect(removeDialogProjectSettingsWorldColorPaletteEntry(entries, 'missing')).toBeNull()
})

test('Test that wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength respects the palette cap', () => {
  const entries = [{
    hex: '#112233',
    id: 'a'
  }]
  const serialize = (hexList: readonly string[]) => hexList.join(';')
  const wouldExceed = (colorPallete: string, appendHex: string, maxLength: number) => {
    return colorPallete.length + 1 + appendHex.length > maxLength
  }
  expect(wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength(
    entries,
    'a',
    serialize,
    wouldExceed,
    20
  )).toBe(false)
  expect(wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength(
    entries,
    'a',
    serialize,
    wouldExceed,
    7
  )).toBe(true)
  expect(wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength(
    entries,
    'missing',
    serialize,
    wouldExceed,
    20
  )).toBe(true)
})
