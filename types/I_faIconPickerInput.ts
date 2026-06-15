/** Icon pack ids aligned with quasar.config extras and generated catalog filenames. */
export type T_faIconPickerPackId = 'fontawesome-v6' | 'material-icons' | 'mdi-v7'

export const FA_ICON_PICKER_PACK_IDS: readonly T_faIconPickerPackId[] = [
  'mdi-v7',
  'fontawesome-v6',
  'material-icons'
]

/** Placeholder q-icon name when modelValue is empty. */
export const FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON = 'mdi-file-outline'

/** Icons per row in the virtual-scrolled grid (must match SCSS). */
export const FA_ICON_PICKER_ICONS_PER_ROW = 16

/** Virtual scroll row height in pixels (must match SCSS). */
export const FA_ICON_PICKER_VIRTUAL_ROW_HEIGHT_PX = 52

/** Debounce delay for search input in the picker menu. */
export const FA_ICON_PICKER_SEARCH_DEBOUNCE_MS = 150

export type T_faIconPickerCatalogRow = readonly string[]

export type I_faIconPickerInputComposableDeps = {
  chunkFaIconPickerCatalogIntoRows: (
    icons: readonly string[],
    iconsPerRow: number
  ) => T_faIconPickerCatalogRow[]
  computed: <T>(fn: () => T) => import('app/types/I_vueCompositionShims').I_computedRef<T>
  createFaIconPickerSearchDebounce: (options: {
    debouncedSearchQuery: import('app/types/I_vueCompositionShims').I_ref<string>
    searchDebounceMs: number
    searchQuery: import('app/types/I_vueCompositionShims').I_ref<string>
  }) => {
    clearSearchDebounce: () => void
    scheduleSearchDebounce: () => void
  }
  filterFaIconPickerCatalogByQuery: (
    catalog: readonly string[],
    query: string
  ) => string[]
  iconsPerRow: number
  loadFaIconPickerMergedCatalogAsync: () => Promise<string[]>
  loadFaIconPickerMergedCatalogForMenu: (options: {
    catalogCache: import('app/types/I_vueCompositionShims').I_ref<string[] | null>
    catalogLoadError: import('app/types/I_vueCompositionShims').I_ref<string | null>
    isCatalogLoading: import('app/types/I_vueCompositionShims').I_ref<boolean>
    loadFaIconPickerMergedCatalogAsync: () => Promise<string[]>
    loadedCatalog: import('app/types/I_vueCompositionShims').I_ref<string[]>
  }) => Promise<void>
  ref: <T>(value: T) => import('app/types/I_vueCompositionShims').I_ref<T>
  searchDebounceMs: number
}
