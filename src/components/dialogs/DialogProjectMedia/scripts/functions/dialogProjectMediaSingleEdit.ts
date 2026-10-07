import type {
  I_bindDialogProjectMediaSingleEditBound,
  I_bindDialogProjectMediaSingleEditInput
} from 'app/types/I_bindDialogProjectMediaSingleEdit'
import type {
  I_faProjectMedia,
  I_faProjectMediaMassEditRow,
  T_faProjectMediaPanel
} from 'app/types/I_faProjectMediaDomain'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

const singleEditPanel: T_faProjectMediaPanel = 'mediaSingleEdit'

/** Vue Transition duration for the list single-edit slide. Matches the CSS token. */
export const FA_DIALOG_PROJECT_MEDIA_SINGLE_EDIT_SLIDE_MS = 300

/**
 * Clone a saved medium into draft plus baseline and open the slide.
 */
export function openFaProjectMediaSingleEditSlide (input: {
  baseline: I_ref<I_faProjectMediaMassEditRow | null>
  draft: I_ref<I_faProjectMediaMassEditRow | null>
  item: I_faProjectMedia
  mapItemToRow: (item: I_faProjectMedia) => I_faProjectMediaMassEditRow
  slideOpen: I_ref<boolean>
}): void {
  input.draft.value = input.mapItemToRow(input.item)
  input.baseline.value = input.mapItemToRow(input.item)
  input.slideOpen.value = true
}

/**
 * Hide the list slide so Vue can play the leave transition. Draft stays until discard.
 */
export function closeFaProjectMediaSingleEditSlide (input: {
  slideOpen: I_ref<boolean>
}): void {
  input.slideOpen.value = false
}

/**
 * Drop the single-edit draft after the slide leave transition, or when the dialog resets.
 */
export function discardFaProjectMediaSingleEditDraft (input: {
  baseline: I_ref<I_faProjectMediaMassEditRow | null>
  draft: I_ref<I_faProjectMediaMassEditRow | null>
}): void {
  input.draft.value = null
  input.baseline.value = null
}

/**
 * True when the generic dialog Close footer should show.
 */
export function resolveDialogProjectMediaShowGenericClose (input: {
  isAddOnlineUrlsPanel: boolean
  isMassEditPanel: boolean
  isSingleEditPanel: boolean
  isSingleEditSlideOpen: boolean
}): boolean {
  if (input.isMassEditPanel) {
    return false
  }
  if (input.isAddOnlineUrlsPanel) {
    return false
  }
  if (input.isSingleEditPanel) {
    return false
  }
  return !input.isSingleEditSlideOpen
}

function attachSingleEditSlideEscape (
  input: I_bindDialogProjectMediaSingleEditInput,
  closeSlide: () => void,
  isDirty: I_computedRef<boolean>,
  isSlideOpen: I_ref<boolean>
): void {
  input.bindSlideEscape({
    attachWindowKeydown: input.attachWindowKeydown,
    blurActiveElement: input.blurActiveElement,
    closeSlide,
    detachWindowKeydown: input.detachWindowKeydown,
    isDirty,
    isSlideFieldActive: input.isSlideFieldActive,
    isSlideOpen,
    onBeforeUnmount: input.onBeforeUnmount,
    watch: input.watch
  })
}

/**
 * Session + chrome for list slide-out and the single-edit tab.
 */
export function bindDialogProjectMediaSingleEdit (
  input: I_bindDialogProjectMediaSingleEditInput
): I_bindDialogProjectMediaSingleEditBound {
  const singleEditDraft = input.ref<I_faProjectMediaMassEditRow | null>(null)
  const singleEditBaseline = input.ref<I_faProjectMediaMassEditRow | null>(null)
  const isSingleEditSlideOpen = input.ref(false)
  const isSingleEditDirty = input.computed(() => {
    return input.isDirtyFn(singleEditDraft.value, singleEditBaseline.value)
  })
  const isSingleEditPanel = input.computed(() => {
    return input.selectedPanel.value === singleEditPanel
  })
  const isSingleEditSaveDisabled = input.computed(() => {
    return singleEditDraft.value === null
  })
  const showGenericClose = input.computed(() => {
    return resolveDialogProjectMediaShowGenericClose({
      isAddOnlineUrlsPanel: input.isAddOnlineUrlsPanel.value,
      isMassEditPanel: input.isMassEditPanel.value,
      isSingleEditPanel: isSingleEditPanel.value,
      isSingleEditSlideOpen: isSingleEditSlideOpen.value
    })
  })

  function closeSingleEditSlide (): void {
    closeFaProjectMediaSingleEditSlide({
      slideOpen: isSingleEditSlideOpen
    })
  }

  function discardSingleEditSlide (): void {
    discardFaProjectMediaSingleEditDraft({
      baseline: singleEditBaseline,
      draft: singleEditDraft
    })
  }

  function openSingleEditSlide (item: I_faProjectMedia): void {
    openFaProjectMediaSingleEditSlide({
      baseline: singleEditBaseline,
      draft: singleEditDraft,
      item,
      mapItemToRow: input.mapItemToRow,
      slideOpen: isSingleEditSlideOpen
    })
  }

  function closeSingleEditDialog (): void {
    input.dialogModel.value = false
  }

  const persistence = input.wirePersistence({
    applyListLoad: input.applyListLoad,
    bindSingleEditSave: input.bindSingleEditSave,
    closeSingleEditSlide,
    computed: input.computed,
    dialogModel: input.dialogModel,
    isSingleEditDirty,
    isSingleEditSlideOpen,
    listLoadGeneration: input.listLoadGeneration,
    listMediaItems: input.listMediaItems,
    loadListMedia: input.loadListMedia,
    mapItemToRow: input.mapItemToRow,
    mapRowToUpsertItem: input.mapRowToUpsertItem,
    openSingleEditSlide,
    runFaActionAwait: input.runFaActionAwait,
    singleEditBaseline,
    singleEditDraft
  })
  attachSingleEditSlideEscape(
    input,
    closeSingleEditSlide,
    isSingleEditDirty,
    isSingleEditSlideOpen
  )

  const saveSingleEditAndCloseDialog = persistence.saveAndCloseDialog
  const saveSingleEditSlide = persistence.saveSlide
  const saveSingleEditSlideStay = persistence.saveSlideStay
  const isSlideNextDisabled = persistence.isSlideNextDisabled
  const isSlidePreviousDisabled = persistence.isSlidePreviousDisabled
  const openSingleEditSlideNext = persistence.openSingleEditSlideNext
  const openSingleEditSlidePrevious = persistence.openSingleEditSlidePrevious
  return {
    closeSingleEditDialog,
    closeSingleEditSlide,
    discardSingleEditSlide,
    isSingleEditDirty,
    isSingleEditPanel,
    isSingleEditSaveDisabled,
    isSingleEditSlideOpen,
    isSlideNextDisabled,
    isSlidePreviousDisabled,
    openSingleEditSlide,
    openSingleEditSlideNext,
    openSingleEditSlidePrevious,
    saveSingleEditAndCloseDialog,
    saveSingleEditSlide,
    saveSingleEditSlideStay,
    showGenericClose,
    singleEditBaseline,
    singleEditDraft
  }
}
