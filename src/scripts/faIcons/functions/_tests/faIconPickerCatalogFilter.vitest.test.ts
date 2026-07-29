import { expect, test } from 'vitest'

import {
  chunkFaIconPickerCatalogIntoRows,
  filterFaIconPickerCatalogByQuery
} from '../faIconPickerCatalogFilter'

/**
 * filterFaIconPickerCatalogByQuery
 * Blank or whitespace-only query returns the full catalog.
 */
test('Test that filterFaIconPickerCatalogByQuery returns full catalog when query is blank', () => {
  const catalog = [
    'mdi-account',
    'mdi-home'
  ]

  expect(filterFaIconPickerCatalogByQuery(catalog, '')).toEqual(catalog)
  expect(filterFaIconPickerCatalogByQuery(catalog, '   ')).toEqual(catalog)
})

/**
 * filterFaIconPickerCatalogByQuery
 * Filters case-insensitively by substring.
 */
test('Test that filterFaIconPickerCatalogByQuery filters case-insensitively by substring', () => {
  const catalog = [
    'mdi-account',
    'mdi-home',
    'fa-solid fa-user'
  ]

  expect(filterFaIconPickerCatalogByQuery(catalog, 'ACCOUNT')).toEqual(['mdi-account'])
  expect(filterFaIconPickerCatalogByQuery(catalog, 'fa-')).toEqual(['fa-solid fa-user'])
})

/**
 * chunkFaIconPickerCatalogIntoRows
 * Returns empty rows when iconsPerRow is below one.
 */
test('Test that chunkFaIconPickerCatalogIntoRows returns empty rows when iconsPerRow is below one', () => {
  expect(chunkFaIconPickerCatalogIntoRows(['mdi-a'], 0)).toEqual([])
})

/**
 * chunkFaIconPickerCatalogIntoRows
 * Chunks icons into fixed-width rows.
 */
test('Test that chunkFaIconPickerCatalogIntoRows chunks icons into fixed-width rows', () => {
  const icons = [
    'a',
    'b',
    'c',
    'd',
    'e'
  ]

  expect(chunkFaIconPickerCatalogIntoRows(icons, 2)).toEqual([
    ['a', 'b'],
    ['c', 'd'],
    ['e']
  ])
})
