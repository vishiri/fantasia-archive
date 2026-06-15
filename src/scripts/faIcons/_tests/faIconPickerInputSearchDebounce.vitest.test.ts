import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { createFaIconPickerSearchDebounce } from '../functions/faIconPickerInputSearchDebounce'

describe('createFaIconPickerSearchDebounce', () => {
  test('debounces search query updates', () => {
    vi.useFakeTimers()

    const searchQuery = ref('mdi')
    const debouncedSearchQuery = ref('')
    const debounce = createFaIconPickerSearchDebounce({
      debouncedSearchQuery,
      searchDebounceMs: 150,
      searchQuery
    })

    debounce.scheduleSearchDebounce()
    expect(debouncedSearchQuery.value).toBe('')

    debounce.clearSearchDebounce()
    debounce.scheduleSearchDebounce()

    vi.advanceTimersByTime(149)
    expect(debouncedSearchQuery.value).toBe('')

    vi.advanceTimersByTime(1)
    expect(debouncedSearchQuery.value).toBe('mdi')

    debounce.clearSearchDebounce()
    vi.useRealTimers()
  })
})
