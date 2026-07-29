import { ResultAsync } from 'neverthrow'
import { flushPromises } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import { computed, ref } from 'vue'

import type { I_ref } from 'app/types/I_vueCompositionShims'
import { FA_ICON_PICKER_SEARCH_DEBOUNCE_MS } from 'app/types/I_faIconPickerInput'

import {
  chunkFaIconPickerCatalogIntoRows,
  filterFaIconPickerCatalogByQuery
} from 'app/src/scripts/faIcons/functions/faIconPickerCatalogFilter'
import { loadFaIconPickerMergedCatalogForMenu as loadFaIconPickerMergedCatalogForMenuImpl } from 'app/src/scripts/faIcons/functions/faIconPickerInputMergedCatalogLoader'
import { createFaIconPickerSearchDebounce } from 'app/src/scripts/faIcons/functions/faIconPickerInputSearchDebounce'
import { createUseFaIconPickerInput } from '../faIconPickerInputComposableWiring'

function loadFaIconPickerMergedCatalogForMenu (options: {
  catalogCache: I_ref<string[] | null>
  catalogLoadError: I_ref<string | null>
  isCatalogLoading: I_ref<boolean>
  loadFaIconPickerMergedCatalogAsync: () => Promise<string[]>
  loadedCatalog: I_ref<string[]>
}): Promise<void> {
  return loadFaIconPickerMergedCatalogForMenuImpl({
    ...options,
    ResultAsync
  })
}

/**
 * createUseFaIconPickerInput
 * Loads merged catalog on menu show and filters after debounced search.
 */
test('Test that createUseFaIconPickerInput loads merged catalog on menu show and filters after debounced search', async () => {
  vi.useFakeTimers()

  const loadFaIconPickerMergedCatalogAsync = vi.fn(async () => [
    'mdi-account',
    'mdi-home',
    'fa-solid fa-user'
  ])

  const useFaIconPickerInput = createUseFaIconPickerInput({
    chunkFaIconPickerCatalogIntoRows,
    computed,
    createFaIconPickerSearchDebounce,
    filterFaIconPickerCatalogByQuery,
    iconsPerRow: 8,
    loadFaIconPickerMergedCatalogAsync,
    loadFaIconPickerMergedCatalogForMenu,
    ref,
    searchDebounceMs: FA_ICON_PICKER_SEARCH_DEBOUNCE_MS
  })

  const modelValue = ref('mdi-home')
  const emitted: string[] = []

  const api = useFaIconPickerInput({
    defaultIcon: 'mdi-file-outline',
    emitModelValue: (value) => {
      emitted.push(value)
    },
    modelValue
  })

  api.onMenuShow()
  await vi.waitFor(() => {
    expect(loadFaIconPickerMergedCatalogAsync).toHaveBeenCalledTimes(1)
    expect(api.catalogRows.value[0]).toBeDefined()
  })
  expect(api.catalogRows.value[0]!).toContain('mdi-account')
  expect(api.catalogRows.value[0]!).toContain('fa-solid fa-user')

  api.onSearchQueryUpdate('account')
  expect(api.catalogRows.value.flat()).toContain('mdi-home')

  vi.advanceTimersByTime(FA_ICON_PICKER_SEARCH_DEBOUNCE_MS)
  expect(api.catalogRows.value).toEqual([
    ['mdi-account']
  ])

  api.onIconSelect('mdi-account')
  expect(emitted).toEqual(['mdi-account'])
  expect(api.menuOpen.value).toBe(false)

  api.onMenuHide()
  expect(api.searchQuery.value).toBe('')

  vi.useRealTimers()
})

/**
 * createUseFaIconPickerInput
 * Reuses cached merged catalog when menu reopens.
 */
test('Test that createUseFaIconPickerInput reuses cached merged catalog when menu reopens', async () => {
  const loadFaIconPickerMergedCatalogAsync = vi.fn(async () => [
    'mdi-account',
    'person'
  ])

  const useFaIconPickerInput = createUseFaIconPickerInput({
    chunkFaIconPickerCatalogIntoRows,
    computed,
    createFaIconPickerSearchDebounce,
    filterFaIconPickerCatalogByQuery,
    iconsPerRow: 8,
    loadFaIconPickerMergedCatalogAsync,
    loadFaIconPickerMergedCatalogForMenu,
    ref,
    searchDebounceMs: FA_ICON_PICKER_SEARCH_DEBOUNCE_MS
  })

  const api = useFaIconPickerInput({
    defaultIcon: 'mdi-file-outline',
    emitModelValue: () => {},
    modelValue: ref('')
  })

  api.onMenuShow()
  await vi.waitFor(() => {
    expect(loadFaIconPickerMergedCatalogAsync).toHaveBeenCalledTimes(1)
    expect(api.catalogRows.value.flat()).toEqual([
      'mdi-account',
      'person'
    ])
  })

  api.onMenuHide()
  api.onMenuShow()
  await flushPromises()

  expect(loadFaIconPickerMergedCatalogAsync).toHaveBeenCalledTimes(1)
  expect(api.catalogRows.value.flat()).toEqual([
    'mdi-account',
    'person'
  ])
})

/**
 * createUseFaIconPickerInput
 * Clears search query for nullish search updates and uses default preview icon.
 */
test('Test that createUseFaIconPickerInput clears search query for nullish search updates and uses default preview icon', async () => {
  vi.useFakeTimers()

  const useFaIconPickerInput = createUseFaIconPickerInput({
    chunkFaIconPickerCatalogIntoRows,
    computed,
    createFaIconPickerSearchDebounce,
    filterFaIconPickerCatalogByQuery,
    iconsPerRow: 8,
    loadFaIconPickerMergedCatalogAsync: vi.fn(async () => []),
    loadFaIconPickerMergedCatalogForMenu,
    ref,
    searchDebounceMs: FA_ICON_PICKER_SEARCH_DEBOUNCE_MS
  })

  const modelValue = ref('   ')
  const api = useFaIconPickerInput({
    defaultIcon: 'mdi-file-outline',
    emitModelValue: () => {},
    modelValue
  })

  expect(api.previewIconName.value).toBe('mdi-file-outline')

  api.onSearchQueryUpdate(null)
  expect(api.searchQuery.value).toBe('')

  api.onSearchQueryUpdate(undefined as unknown as null)
  expect(api.searchQuery.value).toBe('')

  vi.useRealTimers()
})
