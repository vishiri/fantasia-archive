import type { I_ref } from 'app/types/I_vueCompositionShims'

export function createFaIconPickerSearchDebounce (deps: {
  debouncedSearchQuery: I_ref<string>
  searchDebounceMs: number
  searchQuery: I_ref<string>
}): {
    clearSearchDebounce: () => void
    scheduleSearchDebounce: () => void
  } {
  let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined

  function clearSearchDebounce (): void {
    if (searchDebounceTimer !== undefined) {
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = undefined
    }
  }

  function scheduleSearchDebounce (): void {
    clearSearchDebounce()
    searchDebounceTimer = setTimeout(() => {
      deps.debouncedSearchQuery.value = deps.searchQuery.value
      searchDebounceTimer = undefined
    }, deps.searchDebounceMs)
  }

  return {
    clearSearchDebounce,
    scheduleSearchDebounce
  }
}
