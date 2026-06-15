import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { T_faIconPickerPackId } from 'app/types/I_faIconPickerInput'

export async function loadFaIconPickerCatalogForPack (deps: {
  activePackId: T_faIconPickerPackId
  catalogCache: I_ref<Partial<Record<T_faIconPickerPackId, string[]>>>
  catalogLoadError: I_ref<string | null>
  isCatalogLoading: I_ref<boolean>
  loadFaIconPickerCatalogAsync: (packId: T_faIconPickerPackId) => Promise<string[]>
  loadedCatalog: I_ref<string[]>
}): Promise<void> {
  const packId = deps.activePackId
  const cached = deps.catalogCache.value[packId]

  if (cached !== undefined) {
    deps.loadedCatalog.value = cached
    deps.catalogLoadError.value = null
    return
  }

  deps.isCatalogLoading.value = true
  deps.catalogLoadError.value = null

  try {
    const catalog = await deps.loadFaIconPickerCatalogAsync(packId)
    deps.catalogCache.value = {
      ...deps.catalogCache.value,
      [packId]: catalog
    }
    deps.loadedCatalog.value = catalog
  } catch (error) {
    deps.catalogLoadError.value = error instanceof Error ? error.message : String(error)
    deps.loadedCatalog.value = []
  } finally {
    deps.isCatalogLoading.value = false
  }
}
