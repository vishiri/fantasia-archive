import { expect, test, vi } from 'vitest'
import { ResultAsync } from 'neverthrow'
import { ref } from 'vue'

import { loadFaIconPickerMergedCatalogForMenu } from '../functions/faIconPickerInputMergedCatalogLoader'

test('Test that loadFaIconPickerMergedCatalogForMenu reuses cached merged catalog without reloading', async () => {
  const loadFaIconPickerMergedCatalogAsync = vi.fn(async () => ['mdi-account'])
  const loadedCatalog = ref<string[]>([])
  const catalogCache = ref<string[] | null>(['mdi-home'])
  const catalogLoadError = ref<string | null>('stale')
  const isCatalogLoading = ref(true)

  await loadFaIconPickerMergedCatalogForMenu({
    ResultAsync,
    catalogCache,
    catalogLoadError,
    isCatalogLoading,
    loadFaIconPickerMergedCatalogAsync,
    loadedCatalog
  })

  expect(loadFaIconPickerMergedCatalogAsync).not.toHaveBeenCalled()
  expect(loadedCatalog.value).toEqual(['mdi-home'])
  expect(catalogLoadError.value).toBeNull()
  expect(isCatalogLoading.value).toBe(true)
})

test('Test that loadFaIconPickerMergedCatalogForMenu loads and caches merged catalog when cache is empty', async () => {
  const loadFaIconPickerMergedCatalogAsync = vi.fn(async () => [
    'fa-solid fa-user',
    'mdi-account'
  ])
  const loadedCatalog = ref<string[]>([])
  const catalogCache = ref<string[] | null>(null)
  const catalogLoadError = ref<string | null>(null)
  const isCatalogLoading = ref(false)

  await loadFaIconPickerMergedCatalogForMenu({
    ResultAsync,
    catalogCache,
    catalogLoadError,
    isCatalogLoading,
    loadFaIconPickerMergedCatalogAsync,
    loadedCatalog
  })

  expect(loadFaIconPickerMergedCatalogAsync).toHaveBeenCalledTimes(1)
  expect(loadedCatalog.value).toEqual([
    'fa-solid fa-user',
    'mdi-account'
  ])
  expect(catalogCache.value).toEqual([
    'fa-solid fa-user',
    'mdi-account'
  ])
  expect(isCatalogLoading.value).toBe(false)
})

test('Test that loadFaIconPickerMergedCatalogForMenu stores Error load failures and clears loaded catalog', async () => {
  const loadFaIconPickerMergedCatalogAsync = vi.fn(async () => {
    throw new Error('catalog failed')
  })
  const loadedCatalog = ref<string[]>(['mdi-account'])
  const catalogCache = ref<string[] | null>(null)
  const catalogLoadError = ref<string | null>(null)
  const isCatalogLoading = ref(false)

  await loadFaIconPickerMergedCatalogForMenu({
    ResultAsync,
    catalogCache,
    catalogLoadError,
    isCatalogLoading,
    loadFaIconPickerMergedCatalogAsync,
    loadedCatalog
  })

  expect(catalogLoadError.value).toBe('catalog failed')
  expect(loadedCatalog.value).toEqual([])
  expect(isCatalogLoading.value).toBe(false)
})

test('Test that loadFaIconPickerMergedCatalogForMenu stringifies non-Error load failures', async () => {
  const loadFaIconPickerMergedCatalogAsync = vi.fn().mockRejectedValue('catalog string failure')
  const loadedCatalog = ref<string[]>(['mdi-account'])
  const catalogCache = ref<string[] | null>(null)
  const catalogLoadError = ref<string | null>(null)
  const isCatalogLoading = ref(false)

  await loadFaIconPickerMergedCatalogForMenu({
    ResultAsync,
    catalogCache,
    catalogLoadError,
    isCatalogLoading,
    loadFaIconPickerMergedCatalogAsync,
    loadedCatalog
  })

  expect(catalogLoadError.value).toBe('catalog string failure')
  expect(loadedCatalog.value).toEqual([])
  expect(isCatalogLoading.value).toBe(false)
})
