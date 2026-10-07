import type { T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'
import type { I_ref } from 'app/types/I_vueCompositionShims'

export async function loadFaIconPickerMergedCatalogForMenu (deps: {
  ResultAsync: T_injectedResultAsync
  catalogCache: I_ref<string[] | null>
  catalogLoadError: I_ref<string | null>
  isCatalogLoading: I_ref<boolean>
  loadFaIconPickerMergedCatalogAsync: () => Promise<string[]>
  loadedCatalog: I_ref<string[]>
  requestSerialBox: { current: number }
}): Promise<void> {
  const cached = deps.catalogCache.value

  if (cached !== null) {
    deps.loadedCatalog.value = cached
    deps.catalogLoadError.value = null
    return
  }

  const requestSerial = deps.requestSerialBox.current + 1
  deps.requestSerialBox.current = requestSerial
  deps.isCatalogLoading.value = true
  deps.catalogLoadError.value = null

  const loadResult = await deps.ResultAsync.fromPromise(
    deps.loadFaIconPickerMergedCatalogAsync(),
    (error): unknown => error
  )
  if (requestSerial !== deps.requestSerialBox.current) {
    return
  }
  if (loadResult.isOk()) {
    deps.catalogCache.value = loadResult.value
    deps.loadedCatalog.value = loadResult.value
  } else {
    const error = loadResult.error
    deps.catalogLoadError.value = error instanceof Error ? error.message : String(error)
    deps.loadedCatalog.value = []
  }
  deps.isCatalogLoading.value = false
}
