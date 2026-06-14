import { expect, test } from 'vitest'

import {
  aggregateFaProjectWorldColorPalleteHexList,
  appendFaProjectWorldColorPalleteHex,
  collectFaProjectWorldColorPalleteDuplicateHexKeys,
  faProjectWorldColorPalleteContainsHex,
  hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates,
  isFaProjectWorldStorageHexColor,
  normalizeFaProjectWorldColorPalleteString,
  parseFaProjectWorldColorPalleteToHexList,
  parseFaProjectWorldColorPalleteToHexListPreservingDuplicates,
  serializeFaProjectWorldColorPalleteFromHexList,
  wouldFaProjectWorldColorPalleteExceedMaxLength
} from '../faProjectWorldColorPalleteHexList'

test('Test that parseFaProjectWorldColorPalleteToHexList parses valid semicolon-separated hex values', () => {
  expect(parseFaProjectWorldColorPalleteToHexList(' #112233;#445566 ')).toEqual([
    '#112233',
    '#445566'
  ])
})

test('Test that parseFaProjectWorldColorPalleteToHexList skips invalid segments', () => {
  expect(parseFaProjectWorldColorPalleteToHexList('#112233;bad;#aabbcc')).toEqual([
    '#112233',
    '#AABBCC'
  ])
})

test('Test that parseFaProjectWorldColorPalleteToHexList skips empty semicolon segments', () => {
  expect(parseFaProjectWorldColorPalleteToHexList('#112233;;#445566')).toEqual([
    '#112233',
    '#445566'
  ])
})

test('Test that parseFaProjectWorldColorPalleteToHexList keeps only the first case-insensitive duplicate', () => {
  expect(parseFaProjectWorldColorPalleteToHexList('#112233;#445566;#112233')).toEqual([
    '#112233',
    '#445566'
  ])
  expect(parseFaProjectWorldColorPalleteToHexList('#aabbcc;#AABBCC')).toEqual(['#AABBCC'])
})

test('Test that parseFaProjectWorldColorPalleteToHexList returns an empty list for blank input', () => {
  expect(parseFaProjectWorldColorPalleteToHexList('')).toEqual([])
  expect(parseFaProjectWorldColorPalleteToHexList('   ')).toEqual([])
})

test('Test that aggregateFaProjectWorldColorPalleteHexList merges palettes in order without duplicates', () => {
  const merged = aggregateFaProjectWorldColorPalleteHexList([
    '#112233;#445566',
    '#aabbcc;#112233'
  ])

  expect(merged).toEqual([
    '#112233',
    '#445566',
    '#AABBCC'
  ])
})

test('Test that aggregateFaProjectWorldColorPalleteHexList returns an empty list for blank input', () => {
  expect(aggregateFaProjectWorldColorPalleteHexList([])).toEqual([])
  expect(aggregateFaProjectWorldColorPalleteHexList(['', '   '])).toEqual([])
})

test('Test that hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates detects repeated hex values', () => {
  expect(hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates('')).toBe(false)
  expect(hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates('   ')).toBe(false)
  expect(hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates('#112233;#AABBCC')).toBe(false)
  expect(hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates('#112233;#112233')).toBe(true)
  expect(hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates('#aabbcc;#AABBCC')).toBe(true)
  expect(hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates('#112233;;#112233')).toBe(true)
  expect(hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates('#112233;bad;#112233')).toBe(true)
})

test('Test that normalizeFaProjectWorldColorPalleteString dedupes and uppercases palette segments', () => {
  expect(normalizeFaProjectWorldColorPalleteString(' #aabbcc;#AABBCC;#112233 ')).toBe('#AABBCC;#112233')
})

test('Test that parseFaProjectWorldColorPalleteToHexListPreservingDuplicates keeps duplicate segments', () => {
  expect(parseFaProjectWorldColorPalleteToHexListPreservingDuplicates('#112233;#445566;#112233')).toEqual([
    '#112233',
    '#445566',
    '#112233'
  ])
  expect(parseFaProjectWorldColorPalleteToHexListPreservingDuplicates('#aabbcc;#AABBCC')).toEqual([
    '#AABBCC',
    '#AABBCC'
  ])
})

test('Test that serializeFaProjectWorldColorPalleteFromHexList joins uppercase hex values', () => {
  expect(serializeFaProjectWorldColorPalleteFromHexList([
    '#112233',
    ' #aabbcc ',
    'bad',
    ''
  ])).toBe('#112233;#AABBCC')
})

test('Test that collectFaProjectWorldColorPalleteDuplicateHexKeys returns repeated lowercase keys', () => {
  const duplicateKeys = collectFaProjectWorldColorPalleteDuplicateHexKeys([
    '#112233',
    '#AABBCC',
    '#445566',
    '#aabbcc'
  ])
  expect(duplicateKeys.has('#aabbcc')).toBe(true)
  expect(duplicateKeys.has('#112233')).toBe(false)
})

test('Test that wouldFaProjectWorldColorPalleteExceedMaxLength respects the stored length cap', () => {
  expect(wouldFaProjectWorldColorPalleteExceedMaxLength('', '#112233', 2000)).toBe(false)
  expect(wouldFaProjectWorldColorPalleteExceedMaxLength('#112233', '#445566', 12)).toBe(true)
  expect(wouldFaProjectWorldColorPalleteExceedMaxLength('', 'bad', 2000)).toBe(true)
  expect(wouldFaProjectWorldColorPalleteExceedMaxLength('', '#112233', 6)).toBe(true)
})

test('Test that parseFaProjectWorldColorPalleteToHexListPreservingDuplicates skips invalid and empty segments', () => {
  expect(parseFaProjectWorldColorPalleteToHexListPreservingDuplicates('')).toEqual([])
  expect(parseFaProjectWorldColorPalleteToHexListPreservingDuplicates('#112233;;bad')).toEqual(['#112233'])
})

test('Test that serializeFaProjectWorldColorPalleteFromHexList skips blank and invalid entries', () => {
  expect(serializeFaProjectWorldColorPalleteFromHexList(['', 'bad', '#aabbcc'])).toBe('#AABBCC')
})

test('Test that collectFaProjectWorldColorPalleteDuplicateHexKeys ignores blank and invalid entries', () => {
  const duplicateKeys = collectFaProjectWorldColorPalleteDuplicateHexKeys(['', 'bad', '#112233'])
  expect(duplicateKeys.size).toBe(0)
})

test('Test that isFaProjectWorldStorageHexColor accepts only #RRGGBB values', () => {
  expect(isFaProjectWorldStorageHexColor('#112233')).toBe(true)
  expect(isFaProjectWorldStorageHexColor(' #aabbcc ')).toBe(true)
  expect(isFaProjectWorldStorageHexColor('')).toBe(false)
  expect(isFaProjectWorldStorageHexColor('red')).toBe(false)
})

test('Test that faProjectWorldColorPalleteContainsHex matches case-insensitively', () => {
  expect(faProjectWorldColorPalleteContainsHex('#112233;#445566', '#445566')).toBe(true)
  expect(faProjectWorldColorPalleteContainsHex('#112233;#445566', '#AABBCC')).toBe(false)
  expect(faProjectWorldColorPalleteContainsHex('', '#112233')).toBe(false)
  expect(faProjectWorldColorPalleteContainsHex('#112233', 'bad')).toBe(false)
  expect(faProjectWorldColorPalleteContainsHex('#112233;;bad', '#112233')).toBe(true)
  expect(faProjectWorldColorPalleteContainsHex(';;bad;#445566', '#112233')).toBe(false)
})

test('Test that appendFaProjectWorldColorPalleteHex appends unique valid colors', () => {
  expect(appendFaProjectWorldColorPalleteHex('', '#112233', 2000)).toBe('#112233')
  expect(appendFaProjectWorldColorPalleteHex('#112233', '#445566', 2000)).toBe('#112233;#445566')
  expect(appendFaProjectWorldColorPalleteHex('#112233', '#112233', 2000)).toBe(null)
  expect(appendFaProjectWorldColorPalleteHex('#112233', 'bad', 2000)).toBe(null)
  expect(appendFaProjectWorldColorPalleteHex('#112233', '#445566', 12)).toBe(null)
})
