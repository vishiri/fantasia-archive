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
    sortableTabs: I_ref<I_faOpenedDocumentTab[]>
  } {
  return function useProjectAppControlBarOpenedTabsSortable (input) {
    const sortableTabs = deps.ref<I_faOpenedDocumentTab[]>([])

    deps.watch(
      () => input.getOpenedDocumentTabs(),
      (tabs) => {
        sortableTabs.value = tabs.map((tab) => {
          return { ...tab }
        })
      },
      {
        deep: true,
        immediate: true
      }
    )

    function onTabsDragEnd (event: { newIndex?: number | undefined, oldIndex?: number | undefined }): void {
      const { oldIndex, newIndex } = event
      if (oldIndex === undefined || newIndex === undefined) {
        return
      }
      if (oldIndex === newIndex) {
        return
      }
      input.onTabReorder(oldIndex, newIndex)
    }

    return {
      onTabsDragEnd,
      sortableTabs
    }
  }
}
