import type {
  I_computedRef,
  I_ref
} from 'app/types/I_vueCompositionShims'
import type {
  I_faIconPickerInputComposableDeps,
  T_faIconPickerCatalogRow
} from 'app/types/I_faIconPickerInput'

export function createUseFaIconPickerInput (
  deps: I_faIconPickerInputComposableDeps
): (options: {
    defaultIcon: string
    emitModelValue: (value: string) => void
    modelValue: I_ref<string>
  }) => {
    catalogLoadError: I_ref<string | null>
    catalogRows: I_computedRef<T_faIconPickerCatalogRow[]>
    hasCatalogRows: I_computedRef<boolean>
    isCatalogLoading: I_ref<boolean>
    menuOpen: I_ref<boolean>
    onIconSelect: (iconName: string) => void
    onMenuHide: () => void
    onMenuShow: () => void
    onSearchQueryUpdate: (value: string | number | null) => void
    previewIconName: I_computedRef<string>
    searchQuery: I_ref<string>
  } {
  return function useFaIconPickerInput (options) {
    return buildFaIconPickerInputComposableApi(deps, options)
  }
}

function buildFaIconPickerInputComposableApi (
  deps: I_faIconPickerInputComposableDeps,
  options: {
    defaultIcon: string
    emitModelValue: (value: string) => void
    modelValue: I_ref<string>
  }
): {
    catalogLoadError: I_ref<string | null>
    catalogRows: I_computedRef<T_faIconPickerCatalogRow[]>
    hasCatalogRows: I_computedRef<boolean>
    isCatalogLoading: I_ref<boolean>
    menuOpen: I_ref<boolean>
    onIconSelect: (iconName: string) => void
    onMenuHide: () => void
    onMenuShow: () => void
    onSearchQueryUpdate: (value: string | number | null) => void
    previewIconName: I_computedRef<string>
    searchQuery: I_ref<string>
  } {
  const menuOpen = deps.ref(false)
  const searchQuery = deps.ref('')
  const debouncedSearchQuery = deps.ref('')
  const loadedCatalog = deps.ref<string[]>([])
  const isCatalogLoading = deps.ref(false)
  const catalogLoadError = deps.ref<string | null>(null)
  const catalogCache = deps.ref<string[] | null>(null)

  const searchDebounce = deps.createFaIconPickerSearchDebounce({
    debouncedSearchQuery,
    searchDebounceMs: deps.searchDebounceMs,
    searchQuery
  })

  const previewIconName = deps.computed(() => {
    const trimmed = options.modelValue.value.trim()
    if (trimmed.length === 0) {
      return options.defaultIcon
    }
    return trimmed
  })

  const catalogRows = deps.computed(() => {
    const filteredCatalog = deps.filterFaIconPickerCatalogByQuery(
      loadedCatalog.value,
      debouncedSearchQuery.value
    )

    return deps.chunkFaIconPickerCatalogIntoRows(
      filteredCatalog,
      deps.iconsPerRow
    )
  })

  const hasCatalogRows = deps.computed(() => catalogRows.value.length > 0)

  const menuHandlers = createFaIconPickerInputMenuHandlers({
    catalogCache,
    catalogLoadError,
    debouncedSearchQuery,
    deps,
    emitModelValue: options.emitModelValue,
    isCatalogLoading,
    loadedCatalog,
    menuOpen,
    searchDebounce,
    searchQuery
  })

  return {
    catalogLoadError,
    catalogRows,
    hasCatalogRows,
    isCatalogLoading,
    menuOpen,
    onIconSelect: menuHandlers.onIconSelect,
    onMenuHide: menuHandlers.onMenuHide,
    onMenuShow: menuHandlers.onMenuShow,
    onSearchQueryUpdate: menuHandlers.onSearchQueryUpdate,
    previewIconName,
    searchQuery
  }
}

function createFaIconPickerInputMenuHandlers (args: {
  catalogCache: I_ref<string[] | null>
  catalogLoadError: I_ref<string | null>
  debouncedSearchQuery: I_ref<string>
  deps: I_faIconPickerInputComposableDeps
  emitModelValue: (value: string) => void
  isCatalogLoading: I_ref<boolean>
  loadedCatalog: I_ref<string[]>
  menuOpen: I_ref<boolean>
  searchDebounce: {
    clearSearchDebounce: () => void
    scheduleSearchDebounce: () => void
  }
  searchQuery: I_ref<string>
}): {
    onIconSelect: (iconName: string) => void
    onMenuHide: () => void
    onMenuShow: () => void
    onSearchQueryUpdate: (value: string | number | null) => void
  } {
  function loadMergedCatalog (): void {
    void args.deps.loadFaIconPickerMergedCatalogForMenu({
      catalogCache: args.catalogCache,
      catalogLoadError: args.catalogLoadError,
      isCatalogLoading: args.isCatalogLoading,
      loadFaIconPickerMergedCatalogAsync: args.deps.loadFaIconPickerMergedCatalogAsync,
      loadedCatalog: args.loadedCatalog
    })
  }

  function onSearchQueryUpdate (value: string | number | null): void {
    args.searchQuery.value = value === null || value === undefined ? '' : String(value)
    args.searchDebounce.scheduleSearchDebounce()
  }

  function onMenuShow (): void {
    loadMergedCatalog()
  }

  function onMenuHide (): void {
    args.searchDebounce.clearSearchDebounce()
    args.searchQuery.value = ''
    args.debouncedSearchQuery.value = ''
  }

  function onIconSelect (iconName: string): void {
    args.emitModelValue(iconName)
    args.menuOpen.value = false
  }

  const onMenuShowBinding = onMenuShow
  const onMenuHideBinding = onMenuHide
  const onSearchQueryUpdateBinding = onSearchQueryUpdate
  const onIconSelectBinding = onIconSelect

  return {
    onIconSelect: onIconSelectBinding,
    onMenuHide: onMenuHideBinding,
    onMenuShow: onMenuShowBinding,
    onSearchQueryUpdate: onSearchQueryUpdateBinding
  }
}
