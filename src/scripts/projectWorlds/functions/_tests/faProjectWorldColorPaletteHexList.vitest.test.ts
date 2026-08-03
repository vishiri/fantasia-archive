import { expect, test } from 'vitest'

import {
  aggregateFaProjectWorldColorPaletteHexList,
  appendFaProjectWorldColorPaletteHex,
  collectFaProjectWorldColorPaletteDuplicateHexKeys,
  faProjectWorldColorPaletteContainsHex,
  hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates,
  isFaProjectWorldStorageHexColor,
  normalizeFaProjectWorldColorPaletteString,
  parseFaProjectWorldColorPaletteToHexList,
  parseFaProjectWorldColorPaletteToHexListPreservingDuplicates,
  serializeFaProjectWorldColorPaletteFromHexList,
  wouldFaProjectWorldColorPaletteExceedMaxLength
} from '../faProjectWorldColorPaletteHexList'

test('Test that parseFaProjectWorldColorPaletteToHexList parses valid semicolon-separated hex values', () => {
  expect(parseFaProjectWorldColorPaletteToHexList(' #112233;#445566 ')).toEqual([
    '#112233',
    '#445566'
  ])
})

test('Test that parseFaProjectWorldColorPaletteToHexList skips invalid segments', () => {
  expect(parseFaProjectWorldColorPaletteToHexList('#112233;bad;#aabbcc')).toEqual([
    '#112233',
    '#AABBCC'
  ])
})

test('Test that parseFaProjectWorldColorPaletteToHexList skips empty semicolon segments', () => {
  expect(parseFaProjectWorldColorPaletteToHexList('#112233;;#445566')).toEqual([
    '#112233',
    '#445566'
  ])
})

test('Test that parseFaProjectWorldColorPaletteToHexList keeps only the first case-insensitive duplicate', () => {
  expect(parseFaProjectWorldColorPaletteToHexList('#112233;#445566;#112233')).toEqual([
    '#112233',
    '#445566'
  ])
  expect(parseFaProjectWorldColorPaletteToHexList('#aabbcc;#AABBCC')).toEqual(['#AABBCC'])
})

test('Test that parseFaProjectWorldColorPaletteToHexList returns an empty list for blank input', () => {
  expect(parseFaProjectWorldColorPaletteToHexList('')).toEqual([])
  expect(parseFaProjectWorldColorPaletteToHexList('   ')).toEqual([])
})

test('Test that aggregateFaProjectWorldColorPaletteHexList merges palettes in order without duplicates', () => {
  const merged = aggregateFaProjectWorldColorPaletteHexList([
    '#112233;#445566',
    '#aabbcc;#112233'
  ])

  expect(merged).toEqual([
    '#112233',
    '#445566',
    '#AABBCC'
  ])
})

test('Test that aggregateFaProjectWorldColorPaletteHexList returns an empty list for blank input', () => {
  expect(aggregateFaProjectWorldColorPaletteHexList([])).toEqual([])
  expect(aggregateFaProjectWorldColorPaletteHexList(['', '   '])).toEqual([])
})

test('Test that hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates detects repeated hex values', () => {
  expect(hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates('')).toBe(false)
  expect(hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates('   ')).toBe(false)
  expect(hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates('#112233;#AABBCC')).toBe(false)
  expect(hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates('#112233;#112233')).toBe(true)
  expect(hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates('#aabbcc;#AABBCC')).toBe(true)
  expect(hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates('#112233;;#112233')).toBe(true)
  expect(hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates('#112233;bad;#112233')).toBe(true)
})

test('Test that normalizeFaProjectWorldColorPaletteString dedupes and uppercases palette segments', () => {
  expect(normalizeFaProjectWorldColorPaletteString(' #aabbcc;#AABBCC;#112233 ')).toBe('#AABBCC;#112233')
})

test('Test that parseFaProjectWorldColorPaletteToHexListPreservingDuplicates keeps duplicate segments', () => {
  expect(parseFaProjectWorldColorPaletteToHexListPreservingDuplicates('#112233;#445566;#112233')).toEqual([
    '#112233',
    '#445566',
    '#112233'
  ])
  expect(parseFaProjectWorldColorPaletteToHexListPreservingDuplicates('#aabbcc;#AABBCC')).toEqual([
    '#AABBCC',
    '#AABBCC'
  ])
})

test('Test that serializeFaProjectWorldColorPaletteFromHexList joins uppercase hex values', () => {
  expect(serializeFaProjectWorldColorPaletteFromHexList([
    '#112233',
    ' #aabbcc ',
    'bad',
    ''
  ])).toBe('#112233;#AABBCC')
})

test('Test that collectFaProjectWorldColorPaletteDuplicateHexKeys returns repeated lowercase keys', () => {
  const duplicateKeys = collectFaProjectWorldColorPaletteDuplicateHexKeys([
    '#112233',
    '#AABBCC',
    '#445566',
    '#aabbcc'
  ])
  expect(duplicateKeys.has('#aabbcc')).toBe(true)
  expect(duplicateKeys.has('#112233')).toBe(false)
})

test('Test that wouldFaProjectWorldColorPaletteExceedMaxLength respects the stored length cap', () => {
  expect(wouldFaProjectWorldColorPaletteExceedMaxLength('', '#112233', 2000)).toBe(false)
  expect(wouldFaProjectWorldColorPaletteExceedMaxLength('#112233', '#445566', 12)).toBe(true)
  expect(wouldFaProjectWorldColorPaletteExceedMaxLength('', 'bad', 2000)).toBe(true)
  expect(wouldFaProjectWorldColorPaletteExceedMaxLength('', '#112233', 6)).toBe(true)
})

test('Test that parseFaProjectWorldColorPaletteToHexListPreservingDuplicates skips invalid and empty segments', () => {
  expect(parseFaProjectWorldColorPaletteToHexListPreservingDuplicates('')).toEqual([])
  expect(parseFaProjectWorldColorPaletteToHexListPreservingDuplicates('#112233;;bad')).toEqual(['#112233'])
})

test('Test that serializeFaProjectWorldColorPaletteFromHexList skips blank and invalid entries', () => {
  expect(serializeFaProjectWorldColorPaletteFromHexList(['', 'bad', '#aabbcc'])).toBe('#AABBCC')
})

test('Test that collectFaProjectWorldColorPaletteDuplicateHexKeys ignores blank and invalid entries', () => {
  const duplicateKeys = collectFaProjectWorldColorPaletteDuplicateHexKeys(['', 'bad', '#112233'])
  expect(duplicateKeys.size).toBe(0)
})

test('Test that isFaProjectWorldStorageHexColor accepts only #RRGGBB values', () => {
  expect(isFaProjectWorldStorageHexColor('#112233')).toBe(true)
  expect(isFaProjectWorldStorageHexColor(' #aabbcc ')).toBe(true)
  expect(isFaProjectWorldStorageHexColor('')).toBe(false)
  expect(isFaProjectWorldStorageHexColor('red')).toBe(false)
})

test('Test that faProjectWorldColorPaletteContainsHex matches case-insensitively', () => {
  expect(faProjectWorldColorPaletteContainsHex('#112233;#445566', '#445566')).toBe(true)
  expect(faProjectWorldColorPaletteContainsHex('#112233;#445566', '#AABBCC')).toBe(false)
  expect(faProjectWorldColorPaletteContainsHex('', '#112233')).toBe(false)
  expect(faProjectWorldColorPaletteContainsHex('#112233', 'bad')).toBe(false)
  expect(faProjectWorldColorPaletteContainsHex('#112233;;bad', '#112233')).toBe(true)
  expect(faProjectWorldColorPaletteContainsHex(';;bad;#445566', '#112233')).toBe(false)
})

test('Test that appendFaProjectWorldColorPaletteHex appends unique valid colors', () => {
  expect(appendFaProjectWorldColorPaletteHex('', '#112233', 2000)).toBe('#112233')
  expect(appendFaProjectWorldColorPaletteHex('#112233', '#445566', 2000)).toBe('#112233;#445566')
  expect(appendFaProjectWorldColorPaletteHex('#112233', '#112233', 2000)).toBe(null)
  expect(appendFaProjectWorldColorPaletteHex('#112233', 'bad', 2000)).toBe(null)
  expect(appendFaProjectWorldColorPaletteHex('#112233', '#445566', 12)).toBe(null)
})
