import type {
  I_bindDialogProjectMediaSingleEditInput
} from 'app/types/I_bindDialogProjectMediaSingleEdit'
import type {
  I_faProjectMedia,
  I_faProjectMediaMassEditRow
} from 'app/types/I_faProjectMediaDomain'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

/**
 * Index of the open slide medium in the visible list, or -1 when missing.
 */
export function resolveFaProjectMediaSlideListIndex (
  items: I_faProjectMedia[],
  currentId: string | null
): number {
  if (currentId === null) {
    return -1
  }
  return items.findIndex((item) => {
    return item.id === currentId
  })
}

/**
 * Previous is the earlier list index; next is the later index.
 */
export function isFaProjectMediaSlideNavDisabled (input: {
  direction: 'next' | 'previous'
  index: number
  isDirty: boolean
  length: number
}): boolean {
  if (input.isDirty || input.index < 0) {
    return true
  }
  if (input.direction === 'previous') {
    return input.index === 0
  }
  return input.index >= input.length - 1
}

/**
 * Neighbor in list order, or null at the ends / unknown id.
 */
export function resolveFaProjectMediaSlideNeighborItem (input: {
  currentId: string | null
  items: I_faProjectMedia[]
  step: -1 | 1
}): I_faProjectMedia | null {
  const index = resolveFaProjectMediaSlideListIndex(input.items, input.currentId)
  if (index < 0) {
    return null
  }
  const neighbor = input.items[index + input.step]
  if (neighbor === undefined) {
    return null
  }
  return neighbor
}

/**
 * Load the neighbor into the open slide when the row is clean and in range.
 */
export function tryOpenFaProjectMediaSingleEditSlideNeighbor (input: {
  draft: I_ref<I_faProjectMediaMassEditRow | null>
  isDirty: I_computedRef<boolean>
  isSlideOpen: I_ref<boolean>
  listMediaItems: I_ref<I_faProjectMedia[]>
  openSlide: (item: I_faProjectMedia) => void
  step: -1 | 1
}): void {
  if (!input.isSlideOpen.value || input.isDirty.value) {
    return
  }
  const neighbor = resolveFaProjectMediaSlideNeighborItem({
    currentId: input.draft.value?.id ?? null,
    items: input.listMediaItems.value,
    step: input.step
  })
  if (neighbor === null) {
    return
  }
  input.openSlide(neighbor)
}

/**
 * Previous / next disable flags and loaders for the list slide-out.
 */
export function bindFaProjectMediaSingleEditSlideNav (input: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  draft: I_ref<I_faProjectMediaMassEditRow | null>
  isDirty: I_computedRef<boolean>
  isSlideOpen: I_ref<boolean>
  listMediaItems: I_ref<I_faProjectMedia[]>
  openSlide: (item: I_faProjectMedia) => void
}): {
    isSlideNextDisabled: I_computedRef<boolean>
    isSlidePreviousDisabled: I_computedRef<boolean>
    openSingleEditSlideNext: () => void
    openSingleEditSlidePrevious: () => void
  } {
  const isSlidePreviousDisabled = input.computed(() => {
    return isFaProjectMediaSlideNavDisabled({
      direction: 'previous',
      index: resolveFaProjectMediaSlideListIndex(
        input.listMediaItems.value,
        input.draft.value?.id ?? null
      ),
      isDirty: input.isDirty.value,
      length: input.listMediaItems.value.length
    })
  })
  const isSlideNextDisabled = input.computed(() => {
    return isFaProjectMediaSlideNavDisabled({
      direction: 'next',
      index: resolveFaProjectMediaSlideListIndex(
        input.listMediaItems.value,
        input.draft.value?.id ?? null
      ),
      isDirty: input.isDirty.value,
      length: input.listMediaItems.value.length
    })
  })
  function openSingleEditSlidePrevious (): void {
    tryOpenFaProjectMediaSingleEditSlideNeighbor({
      draft: input.draft,
      isDirty: input.isDirty,
      isSlideOpen: input.isSlideOpen,
      listMediaItems: input.listMediaItems,
      openSlide: input.openSlide,
      step: -1
    })
  }
  function openSingleEditSlideNext (): void {
    tryOpenFaProjectMediaSingleEditSlideNeighbor({
      draft: input.draft,
      isDirty: input.isDirty,
      isSlideOpen: input.isSlideOpen,
      listMediaItems: input.listMediaItems,
      openSlide: input.openSlide,
      step: 1
    })
  }
  return {
    isSlideNextDisabled,
    isSlidePreviousDisabled,
    openSingleEditSlideNext,
    openSingleEditSlidePrevious
  }
}

/**
 * After stay-open save, clone the reloaded list row into draft and baseline.
 */
export function rebindFaProjectMediaSingleEditDraftFromList (input: {
  baseline: I_ref<I_faProjectMediaMassEditRow | null>
  draft: I_ref<I_faProjectMediaMassEditRow | null>
  id: string
  items: I_faProjectMedia[]
  mapItemToRow: (item: I_faProjectMedia) => I_faProjectMediaMassEditRow
}): void {
  const item = input.items.find((entry) => {
    return entry.id === input.id
  })
  if (item !== undefined) {
    input.draft.value = input.mapItemToRow(item)
    input.baseline.value = input.mapItemToRow(item)
    return
  }
  const current = input.draft.value
  if (current === null) {
    return
  }
  input.baseline.value = { ...current }
}

/**
 * Wire slide save helpers and previous/next loaders.
 */
export function wireDialogProjectMediaSingleEditPersistence (input: {
  applyListLoad: I_bindDialogProjectMediaSingleEditInput['applyListLoad']
  bindSingleEditSave: I_bindDialogProjectMediaSingleEditInput['bindSingleEditSave']
  closeSingleEditSlide: () => void
  computed: I_bindDialogProjectMediaSingleEditInput['computed']
  dialogModel: I_bindDialogProjectMediaSingleEditInput['dialogModel']
  isSingleEditDirty: I_computedRef<boolean>
  isSingleEditSlideOpen: I_ref<boolean>
  listLoadGeneration: I_bindDialogProjectMediaSingleEditInput['listLoadGeneration']
  listMediaItems: I_bindDialogProjectMediaSingleEditInput['listMediaItems']
  loadListMedia: I_bindDialogProjectMediaSingleEditInput['loadListMedia']
  mapItemToRow: I_bindDialogProjectMediaSingleEditInput['mapItemToRow']
  mapRowToUpsertItem: I_bindDialogProjectMediaSingleEditInput['mapRowToUpsertItem']
  openSingleEditSlide: (item: I_faProjectMedia) => void
  runFaActionAwait: I_bindDialogProjectMediaSingleEditInput['runFaActionAwait']
  singleEditBaseline: I_ref<I_faProjectMediaMassEditRow | null>
  singleEditDraft: I_ref<I_faProjectMediaMassEditRow | null>
}): {
    isSlideNextDisabled: I_computedRef<boolean>
    isSlidePreviousDisabled: I_computedRef<boolean>
    openSingleEditSlideNext: () => void
    openSingleEditSlidePrevious: () => void
    saveAndCloseDialog: () => Promise<void>
    saveSlide: () => Promise<void>
    saveSlideStay: () => Promise<void>
  } {
  async function reloadList (): Promise<void> {
    await input.applyListLoad({
      generation: input.listLoadGeneration,
      listItems: input.listMediaItems,
      loadListMedia: input.loadListMedia
    })
  }
  function rebindDraftFromList (id: string): void {
    rebindFaProjectMediaSingleEditDraftFromList({
      baseline: input.singleEditBaseline,
      draft: input.singleEditDraft,
      id,
      items: input.listMediaItems.value,
      mapItemToRow: input.mapItemToRow
    })
  }
  const saveBound = input.bindSingleEditSave({
    closeSlide: input.closeSingleEditSlide,
    dialogModel: input.dialogModel,
    draft: input.singleEditDraft,
    mapRowToUpsertItem: input.mapRowToUpsertItem,
    rebindDraftFromList,
    reloadList,
    runFaActionAwait: input.runFaActionAwait
  })
  const navBound = bindFaProjectMediaSingleEditSlideNav({
    computed: input.computed,
    draft: input.singleEditDraft,
    isDirty: input.isSingleEditDirty,
    isSlideOpen: input.isSingleEditSlideOpen,
    listMediaItems: input.listMediaItems,
    openSlide: input.openSingleEditSlide
  })
  const isSlideNextDisabled = navBound.isSlideNextDisabled
  const isSlidePreviousDisabled = navBound.isSlidePreviousDisabled
  const openSingleEditSlideNext = navBound.openSingleEditSlideNext
  const openSingleEditSlidePrevious = navBound.openSingleEditSlidePrevious
  const saveAndCloseDialog = saveBound.saveAndCloseDialog
  const saveSlide = saveBound.saveSlide
  const saveSlideStay = saveBound.saveSlideStay
  return {
    isSlideNextDisabled,
    isSlidePreviousDisabled,
    openSingleEditSlideNext,
    openSingleEditSlidePrevious,
    saveAndCloseDialog,
    saveSlide,
    saveSlideStay
  }
}
