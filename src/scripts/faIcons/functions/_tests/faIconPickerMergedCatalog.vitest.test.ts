import { describe, expect, test, vi } from 'vitest'

import type { T_faIconPickerPackId } from 'app/types/I_faIconPickerInput'

import {
  loadFaIconPickerMergedCatalogSlicesAsync,
  mergeFaIconPickerCatalogSlices
} from '../faIconPickerMergedCatalog'

describe('mergeFaIconPickerCatalogSlices', () => {
  test('deduplicates and sorts merged icon names', () => {
    expect(
      mergeFaIconPickerCatalogSlices([
        [
          'mdi-z',
          'mdi-account'
        ],
        [
          'mdi-account',
          'fa-solid fa-user'
        ],
        [
          'person'
        ]
      ])
    ).toEqual([
      'fa-solid fa-user',
      'mdi-account',
      'mdi-z',
      'person'
    ])
  })
})

describe('loadFaIconPickerMergedCatalogSlicesAsync', () => {
  test('loads every pack slice before merging', async () => {
    const loadFaIconPickerCatalogAsync = vi.fn(async (packId: T_faIconPickerPackId) => {
      if (packId === 'mdi-v7') {
        return ['mdi-home']
      }

      if (packId === 'fontawesome-v6') {
        return ['fa-solid fa-user']
      }

      return ['person']
    })

    await expect(
      loadFaIconPickerMergedCatalogSlicesAsync({
        loadFaIconPickerCatalogAsync,
        packIds: [
          'mdi-v7',
          'fontawesome-v6',
          'material-icons'
        ]
      })
    ).resolves.toEqual([
      'fa-solid fa-user',
      'mdi-home',
      'person'
    ])

    expect(loadFaIconPickerCatalogAsync).toHaveBeenCalledTimes(3)
  })
})
