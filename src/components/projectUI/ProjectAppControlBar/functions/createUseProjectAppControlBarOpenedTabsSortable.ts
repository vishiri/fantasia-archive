import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_ref } from 'app/types/I_vueCompositionShims'

export function createUseProjectAppControlBarOpenedTabsSortable (deps: {
  ref: <T>(value: T) => I_ref<T>
  watch: (
    source: () => readonly I_faOpenedDocumentTab[],
    callback: (tabs: readonly I_faOpenedDocumentTab[]) => void,
    options: { deep: boolean, immediate: boolean }
  ) => void
}): (input: {
    getOpenedDocumentTabs: () => readonly I_faOpenedDocumentTab[]
    onTabReorder: (fromIndex: number, toIndex: number) => void
  }) => {
    onTabsDragEnd: (event: { newIndex?: number | undefined, oldIndex?: number | undefined }) => void
    onTabsDragStart: () => void
    sortableTabs: I_ref<I_faOpenedDocumentTab[]>
  } {
  return function useProjectAppControlBarOpenedTabsSortable (input) {
    const sortableTabs = deps.ref<I_faOpenedDocumentTab[]>([])
    let tabsDragActive = false
    let skippedTabsSyncDuringDrag = false

    function copyOpenedTabs (
      tabs: readonly I_faOpenedDocumentTab[]
    ): I_faOpenedDocumentTab[] {
      return tabs.map((tab) => {
        return { ...tab }
      })
    }

    deps.watch(
      () => input.getOpenedDocumentTabs(),
      (tabs) => {
        if (tabsDragActive) {
          skippedTabsSyncDuringDrag = true
          return
        }
        sortableTabs.value = copyOpenedTabs(tabs)
      },
      {
        deep: true,
        immediate: true
      }
    )

    function onTabsDragStart (): void {
      tabsDragActive = true
    }

    function onTabsDragEnd (event: { newIndex?: number | undefined, oldIndex?: number | undefined }): void {
      tabsDragActive = false
      const { oldIndex, newIndex } = event
      const reorder = oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex
      if (reorder) {
        input.onTabReorder(oldIndex, newIndex)
      } else if (skippedTabsSyncDuringDrag) {
        sortableTabs.value = copyOpenedTabs(input.getOpenedDocumentTabs())
      }
      skippedTabsSyncDuringDrag = false
    }

    return {
      onTabsDragEnd,
      onTabsDragStart,
      sortableTabs
    }
  }
}
