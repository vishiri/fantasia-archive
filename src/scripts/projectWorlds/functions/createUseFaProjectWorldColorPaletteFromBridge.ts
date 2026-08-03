import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

export function createUseFaProjectWorldColorPaletteFromBridge (deps: {
  aggregateFaProjectWorldColorPaletteHexList: (colorPaletteStrings: readonly string[]) => string[]
  computed: <T>(fn: () => T) => I_computedRef<T>
  getActiveProjectId: () => string | null
  listWorldColorPaletteStrings: () => Promise<readonly string[]>
  ref: <T>(value: T) => I_ref<T>
  watch: (
    source: () => string | null,
    callback: () => void,
    options?: { immediate?: boolean }
  ) => void
}): (options: { enabled: I_computedRef<boolean> }) => {
    paletteHexList: I_ref<string[]>
    refreshPaletteFromBridge: () => Promise<void>
  } {
  return function useFaProjectWorldColorPaletteFromBridge (options: { enabled: I_computedRef<boolean> }) {
    const paletteHexList = deps.ref<string[]>([])

    async function refreshPaletteFromBridge (): Promise<void> {
      if (!options.enabled.value) {
        return
      }
      const projectId = deps.getActiveProjectId()
      if (projectId === null) {
        paletteHexList.value = []
        return
      }
      const colorPaletteStrings = await deps.listWorldColorPaletteStrings()
      paletteHexList.value = deps.aggregateFaProjectWorldColorPaletteHexList(colorPaletteStrings)
    }

    deps.watch(
      () => deps.getActiveProjectId(),
      () => {
        void refreshPaletteFromBridge()
      },
      { immediate: true }
    )

    return {
      paletteHexList,
      refreshPaletteFromBridge
    }
  }
}
