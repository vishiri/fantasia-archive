import type { I_ref } from 'app/types/I_vueCompositionShims'

export async function loadFaIconPickerMergedCatalogForMenu (deps: {
  catalogCache: I_ref<string[] | null>
  catalogLoadError: I_ref<string | null>
  isCatalogLoading: I_ref<boolean>
  loadFaIconPickerMergedCatalogAsync: () => Promise<string[]>
  loadedCatalog: I_ref<string[]>
}): Promise<void> {
  const cached = deps.catalogCache.value

  if (cached !== null) {
    deps.loadedCatalog.value = cached
    deps.catalogLoadError.value = null
    return
  }

  deps.isCatalogLoading.value = true
  deps.catalogLoadError.value = null

  try {
    const catalog = await deps.loadFaIconPickerMergedCatalogAsync()
    deps.catalogCache.value = catalog
    deps.loadedCatalog.value = catalog
  } catch (error) {
    deps.catalogLoadError.value = error instanceof Error ? error.message : String(error)
    deps.loadedCatalog.value = []
  } finally {
    deps.isCatalogLoading.value = false
  }
}
