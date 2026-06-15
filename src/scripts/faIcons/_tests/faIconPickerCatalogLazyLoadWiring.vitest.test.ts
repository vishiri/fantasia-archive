import { describe, expect, test, vi } from 'vitest'

import { loadFaIconPickerCatalogAsync } from '../faIconPickerCatalogLazyLoadWiring'

vi.mock('app/src/scripts/faIcons/catalogs/mdi-v7.catalog.json', () => ({
  default: [
    'mdi-account'
  ]
}))

vi.mock('app/src/scripts/faIcons/catalogs/fontawesome-v6.catalog.json', () => ({
  default: [
    'fa-solid fa-user'
  ]
}))

vi.mock('app/src/scripts/faIcons/catalogs/material-icons.catalog.json', () => ({
  default: [
    'person'
  ]
}))

describe('loadFaIconPickerCatalogAsync', () => {
  test('loads each committed catalog pack', async () => {
    await expect(loadFaIconPickerCatalogAsync('mdi-v7')).resolves.toEqual(['mdi-account'])
    await expect(loadFaIconPickerCatalogAsync('fontawesome-v6')).resolves.toEqual(['fa-solid fa-user'])
    await expect(loadFaIconPickerCatalogAsync('material-icons')).resolves.toEqual(['person'])
  })

  test('returns unknown pack ids from exhaustiveness default branch', async () => {
    await expect(
      loadFaIconPickerCatalogAsync('unknown-pack' as 'mdi-v7')
    ).resolves.toBe('unknown-pack')
  })
})
