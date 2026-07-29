import { expect, test, vi } from 'vitest'

import type { T_faIconPickerPackId } from 'app/types/I_faIconPickerInput'

import {
  loadFaIconPickerMergedCatalogSlicesAsync,
  mergeFaIconPickerCatalogSlices
} from '../faIconPickerMergedCatalog'

/**
 * mergeFaIconPickerCatalogSlices
 * Deduplicates and sorts merged icon names across slices.
 */
test('Test that mergeFaIconPickerCatalogSlices deduplicates and sorts merged icon names', () => {
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

/**
 * loadFaIconPickerMergedCatalogSlicesAsync
 * Loads every pack slice before merging.
 */
test('Test that loadFaIconPickerMergedCatalogSlicesAsync loads every pack slice before merging', async () => {
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
