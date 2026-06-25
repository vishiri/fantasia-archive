import { describe, expect, test, vi } from 'vitest'
import { computed, ref } from 'vue'

import { FA_ICON_PICKER_SEARCH_DEBOUNCE_MS } from 'app/types/I_faIconPickerInput'

import {
  chunkFaIconPickerCatalogIntoRows,
  filterFaIconPickerCatalogByQuery
} from 'app/src/scripts/faIcons/functions/faIconPickerCatalogFilter'
import { loadFaIconPickerMergedCatalogForMenu } from 'app/src/scripts/faIcons/functions/faIconPickerInputMergedCatalogLoader'
import { createFaIconPickerSearchDebounce } from 'app/src/scripts/faIcons/functions/faIconPickerInputSearchDebounce'
import { createUseFaIconPickerInput } from '../faIconPickerInputComposableWiring'

describe('createUseFaIconPickerInput', () => {
  test('loads merged catalog on menu show and filters after debounced search', async () => {
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
    await Promise.resolve()
    await Promise.resolve()

    expect(loadFaIconPickerMergedCatalogAsync).toHaveBeenCalledTimes(1)
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

  test('reuses cached merged catalog when menu reopens', async () => {
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
    await Promise.resolve()
    await Promise.resolve()

    api.onMenuHide()
    api.onMenuShow()
    await Promise.resolve()

    expect(loadFaIconPickerMergedCatalogAsync).toHaveBeenCalledTimes(1)
    expect(api.catalogRows.value.flat()).toEqual([
      'mdi-account',
      'person'
    ])
  })

  test('clears search query for nullish search updates and uses default preview icon', async () => {
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
})
