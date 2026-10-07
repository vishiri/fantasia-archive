import type {
  I_faProjectMedia,
  I_faProjectMediaMassEditRow,
  I_faProjectMediaUpsertItem,
  T_faProjectMediaPanel
} from 'app/types/I_faProjectMediaDomain'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

/** Keydown subset for Project Media list single-edit Escape. */
export interface I_dialogProjectMediaSingleEditKeydownEvent {
  key: string
  preventDefault: () => void
  stopPropagation: () => void
  target: EventTarget | null
}

/** Deps for bindFaProjectMediaSingleEditSlideEscape. */
export interface I_bindFaProjectMediaSingleEditSlideEscapeInput {
  attachWindowKeydown: (
    handler: (event: I_dialogProjectMediaSingleEditKeydownEvent) => void
  ) => void
  blurActiveElement: () => void
  closeSlide: () => void
  detachWindowKeydown: (
    handler: (event: I_dialogProjectMediaSingleEditKeydownEvent) => void
  ) => void
  isDirty: I_computedRef<boolean>
  isSlideFieldActive: (target: EventTarget | null) => boolean
  isSlideOpen: I_ref<boolean>
  onBeforeUnmount: (hook: () => void) => void
  watch: (source: () => unknown, effect: () => void) => void
}

/** Deps for bindDialogProjectMediaSingleEdit. */
export interface I_bindDialogProjectMediaSingleEditInput {
  applyListLoad: (input: {
    generation: { value: number }
    listItems: I_ref<I_faProjectMedia[]>
    loadListMedia: () => Promise<I_faProjectMedia[]>
  }) => Promise<void>
  attachWindowKeydown: (
    handler: (event: I_dialogProjectMediaSingleEditKeydownEvent) => void
  ) => void
  bindSingleEditSave: (saveInput: {
    closeSlide: () => void
    dialogModel: I_ref<boolean>
    draft: I_ref<I_faProjectMediaMassEditRow | null>
    mapRowToUpsertItem: (row: I_faProjectMediaMassEditRow) => I_faProjectMediaUpsertItem
    rebindDraftFromList: (id: string) => void
    reloadList: () => Promise<void>
    runFaActionAwait: (
      id: 'saveProjectMedia',
      payload: { items: I_faProjectMediaUpsertItem[] }
    ) => Promise<boolean>
  }) => {
    saveAndCloseDialog: () => Promise<void>
    saveSlide: () => Promise<void>
    saveSlideStay: () => Promise<void>
  }
  wirePersistence: (persistInput: {
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
  }) => {
    isSlideNextDisabled: I_computedRef<boolean>
    isSlidePreviousDisabled: I_computedRef<boolean>
    openSingleEditSlideNext: () => void
    openSingleEditSlidePrevious: () => void
    saveAndCloseDialog: () => Promise<void>
    saveSlide: () => Promise<void>
    saveSlideStay: () => Promise<void>
  }
  bindSlideEscape: (input: I_bindFaProjectMediaSingleEditSlideEscapeInput) => void
  blurActiveElement: () => void
  computed: <T>(getter: () => T) => I_computedRef<T>
  detachWindowKeydown: (
    handler: (event: I_dialogProjectMediaSingleEditKeydownEvent) => void
  ) => void
  dialogModel: I_ref<boolean>
  isAddOnlineUrlsPanel: I_computedRef<boolean>
  isDirtyFn: (
    draft: I_faProjectMediaMassEditRow | null,
    baseline: I_faProjectMediaMassEditRow | null
  ) => boolean
  isMassEditPanel: I_computedRef<boolean>
  isSlideFieldActive: (target: EventTarget | null) => boolean
  listLoadGeneration: { value: number }
  listMediaItems: I_ref<I_faProjectMedia[]>
  loadListMedia: () => Promise<I_faProjectMedia[]>
  mapItemToRow: (item: I_faProjectMedia) => I_faProjectMediaMassEditRow
  mapRowToUpsertItem: (row: I_faProjectMediaMassEditRow) => I_faProjectMediaUpsertItem
  onBeforeUnmount: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  runFaActionAwait: (
    id: 'saveProjectMedia',
    payload: { items: I_faProjectMediaUpsertItem[] }
  ) => Promise<boolean>
  selectedPanel: I_ref<T_faProjectMediaPanel>
  watch: (source: () => unknown, effect: () => void) => void
}

/** Bound single-edit session for DialogProjectMedia. */
export interface I_bindDialogProjectMediaSingleEditBound {
  closeSingleEditDialog: () => void
  closeSingleEditSlide: () => void
  discardSingleEditSlide: () => void
  isSingleEditDirty: I_computedRef<boolean>
  isSingleEditPanel: I_computedRef<boolean>
  isSingleEditSaveDisabled: I_computedRef<boolean>
  isSingleEditSlideOpen: I_ref<boolean>
  isSlideNextDisabled: I_computedRef<boolean>
  isSlidePreviousDisabled: I_computedRef<boolean>
  openSingleEditSlide: (item: I_faProjectMedia) => void
  openSingleEditSlideNext: () => void
  openSingleEditSlidePrevious: () => void
  saveSingleEditAndCloseDialog: () => Promise<void>
  saveSingleEditSlide: () => Promise<void>
  saveSingleEditSlideStay: () => Promise<void>
  showGenericClose: I_computedRef<boolean>
  singleEditBaseline: I_ref<I_faProjectMediaMassEditRow | null>
  singleEditDraft: I_ref<I_faProjectMediaMassEditRow | null>
}
