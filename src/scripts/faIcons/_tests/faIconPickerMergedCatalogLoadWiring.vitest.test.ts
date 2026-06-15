import { describe, expect, test, vi } from 'vitest'

import { loadFaIconPickerMergedCatalogAsync } from '../faIconPickerMergedCatalogLoadWiring'

vi.mock('../faIconPickerCatalogLazyLoadWiring', () => ({
  loadFaIconPickerCatalogAsync: vi.fn(async (packId: string) => {
    if (packId === 'mdi-v7') {
      return ['mdi-home']
    }

    if (packId === 'fontawesome-v6') {
      return ['fa-solid fa-user']
    }

    return ['person']
  })
}))

describe('loadFaIconPickerMergedCatalogAsync', () => {
  test('loads and merges every configured icon pack', async () => {
    await expect(loadFaIconPickerMergedCatalogAsync()).resolves.toEqual([
      'fa-solid fa-user',
      'mdi-home',
      'person'
    ])
  })
})
