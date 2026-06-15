import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { T_faIconPickerPackId } from 'app/types/I_faIconPickerInput'

import { loadFaIconPickerCatalogForPack } from '../functions/faIconPickerInputCatalogLoader'

describe('loadFaIconPickerCatalogForPack', () => {
  test('reuses cached catalog entries without reloading', async () => {
    const loadFaIconPickerCatalogAsync = vi.fn(async () => ['mdi-account'])
    const loadedCatalog = ref<string[]>([])
    const catalogCache = ref<Partial<Record<T_faIconPickerPackId, string[]>>>({
      'mdi-v7': ['mdi-home']
    })
    const catalogLoadError = ref<string | null>('stale')
    const isCatalogLoading = ref(true)

    await loadFaIconPickerCatalogForPack({
      activePackId: 'mdi-v7',
      catalogCache,
      catalogLoadError,
      isCatalogLoading,
      loadFaIconPickerCatalogAsync,
      loadedCatalog
    })

    expect(loadFaIconPickerCatalogAsync).not.toHaveBeenCalled()
    expect(loadedCatalog.value).toEqual(['mdi-home'])
    expect(catalogLoadError.value).toBeNull()
    expect(isCatalogLoading.value).toBe(true)
  })

  test('loads and caches catalog when pack is missing from cache', async () => {
    const loadFaIconPickerCatalogAsync = vi.fn(async () => ['fa-solid fa-user'])
    const loadedCatalog = ref<string[]>([])
    const catalogCache = ref<Partial<Record<T_faIconPickerPackId, string[]>>>({
      'mdi-v7': ['mdi-account']
    })
    const catalogLoadError = ref<string | null>(null)
    const isCatalogLoading = ref(false)

    await loadFaIconPickerCatalogForPack({
      activePackId: 'fontawesome-v6',
      catalogCache,
      catalogLoadError,
      isCatalogLoading,
      loadFaIconPickerCatalogAsync,
      loadedCatalog
    })

    expect(loadFaIconPickerCatalogAsync).toHaveBeenCalledWith('fontawesome-v6')
    expect(loadedCatalog.value).toEqual(['fa-solid fa-user'])
    expect(catalogCache.value).toEqual({
      'fontawesome-v6': ['fa-solid fa-user'],
      'mdi-v7': ['mdi-account']
    })
    expect(isCatalogLoading.value).toBe(false)
  })

  test('stringifies non-Error load failures', async () => {
    const loadFaIconPickerCatalogAsync = vi.fn().mockRejectedValue('catalog string failure')
    const loadedCatalog = ref<string[]>(['mdi-account'])
    const catalogCache = ref<Partial<Record<T_faIconPickerPackId, string[]>>>({})
    const catalogLoadError = ref<string | null>(null)
    const isCatalogLoading = ref(false)

    await loadFaIconPickerCatalogForPack({
      activePackId: 'mdi-v7',
      catalogCache,
      catalogLoadError,
      isCatalogLoading,
      loadFaIconPickerCatalogAsync,
      loadedCatalog
    })

    expect(catalogLoadError.value).toBe('catalog string failure')
    expect(loadedCatalog.value).toEqual([])
    expect(isCatalogLoading.value).toBe(false)
  })

  test('stores load failures and clears loaded catalog', async () => {
    const loadFaIconPickerCatalogAsync = vi.fn(async () => {
      throw new Error('catalog failed')
    })
    const loadedCatalog = ref<string[]>(['mdi-account'])
    const catalogCache = ref<Partial<Record<T_faIconPickerPackId, string[]>>>({})
    const catalogLoadError = ref<string | null>(null)
    const isCatalogLoading = ref(false)

    await loadFaIconPickerCatalogForPack({
      activePackId: 'material-icons',
      catalogCache,
      catalogLoadError,
      isCatalogLoading,
      loadFaIconPickerCatalogAsync,
      loadedCatalog
    })

    expect(catalogLoadError.value).toBe('catalog failed')
    expect(loadedCatalog.value).toEqual([])
    expect(isCatalogLoading.value).toBe(false)
  })
})
