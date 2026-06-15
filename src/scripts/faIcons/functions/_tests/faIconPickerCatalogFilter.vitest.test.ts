import { describe, expect, test } from 'vitest'

import {
  chunkFaIconPickerCatalogIntoRows,
  filterFaIconPickerCatalogByQuery
} from '../faIconPickerCatalogFilter'

describe('filterFaIconPickerCatalogByQuery', () => {
  test('returns full catalog when query is blank', () => {
    const catalog = [
      'mdi-account',
      'mdi-home'
    ]

    expect(filterFaIconPickerCatalogByQuery(catalog, '')).toEqual(catalog)
    expect(filterFaIconPickerCatalogByQuery(catalog, '   ')).toEqual(catalog)
  })

  test('filters case-insensitively by substring', () => {
    const catalog = [
      'mdi-account',
      'mdi-home',
      'fa-solid fa-user'
    ]

    expect(filterFaIconPickerCatalogByQuery(catalog, 'ACCOUNT')).toEqual(['mdi-account'])
    expect(filterFaIconPickerCatalogByQuery(catalog, 'fa-')).toEqual(['fa-solid fa-user'])
  })
})

describe('chunkFaIconPickerCatalogIntoRows', () => {
  test('returns empty rows when iconsPerRow is below one', () => {
    expect(chunkFaIconPickerCatalogIntoRows(['mdi-a'], 0)).toEqual([])
  })

  test('chunks icons into fixed-width rows', () => {
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
})
