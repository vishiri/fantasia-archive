import type { Reactive } from 'vue'

import type { T_faColorPickerInputPalette } from 'app/types/I_faColorPickerInput'
import type { T_faDialogProjectSettingsWorldColorPaletteDuplicateIconColor } from 'app/types/I_faColorContrast'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { SortableEvent } from 'sortablejs'

/** Draft world row in Project Settings before save. */
export interface I_dialogProjectSettingsWorldDraft {
  id: string
  displayName: string
  color: string
  colorPallete: string
  documentCount: number
}

/** One draggable palette swatch row in Project Settings worlds detail. */
export interface I_dialogProjectSettingsWorldColorPaletteEntry {
  id: string
  hex: string
}

/** Composable API returned by useDialogProjectSettingsWorldColorPaletteEditor. */
export interface I_dialogProjectSettingsWorldColorPaletteEditorApi {
  VueDraggable: unknown
  colorPaletteEntries: I_ref<I_dialogProjectSettingsWorldColorPaletteEntry[]>
  duplicateHexKeys: I_computedRef<ReadonlySet<string>>
  draggingEntryId: I_ref<string | null>
  editorRootClassList: I_computedRef<Record<string, boolean>>
  faVerticalDraggableTabsSortableDragOptions: Record<string, unknown>
  hideNativeSortableDragGhost: (
    dataTransfer: DataTransfer,
    dragEl: HTMLElement
  ) => void
  isAddDisabled: I_computedRef<boolean>
  isListDragging: I_computedRef<boolean>
  onAddColor: () => void
  onDragEnd: () => void
  onDragStart: (event: SortableEvent) => void
  onSwatchColorUpdate: (entryId: string, hex: string) => void
  onSwatchDelete: (entryId: string) => void
  onSwatchDuplicate: (entryId: string) => void
  openSwatchIndex: I_ref<number | null>
  worldPickerPalette: I_computedRef<T_faColorPickerInputPalette>
  setOpenSwatchIndex: (index: number | null) => void
  wouldSwatchDuplicateExceedMaxLength: (entryId: string) => boolean
}

/** Composable API returned by useDialogProjectSettingsWorldColorPaletteSwatch. */
export interface I_dialogProjectSettingsWorldColorPaletteSwatchApi {
  displayHex: I_computedRef<string>
  duplicateIconColor: I_computedRef<T_faDialogProjectSettingsWorldColorPaletteDuplicateIconColor>
  hasPaletteFooter: I_computedRef<boolean>
  isDuplicate: I_computedRef<boolean>
  menuOffset: I_computedRef<[number, number]>
  onPickerChange: (value: string | null) => void
  onPickerMenuHide: () => void
  onPickerUpdate: (value: string | null) => void
  swatchStyle: I_computedRef<{ backgroundColor: string }>
  tooltipHex: I_computedRef<string>
}

/** Injected dependencies for useDialogProjectSettingsWorldColorPaletteSwatch wiring. */
export type T_dialogProjectSettingsWorldColorPaletteSwatchUseDeps = {
  blackHex: string
  computed: <T>(fn: () => T) => I_computedRef<T>
  duplicateIconMinContrastRatio: number
  isDialogProjectSettingsWorldColorPaletteSwatchDuplicate: (
    hex: string,
    duplicateHexKeys: ReadonlySet<string>
  ) => boolean
  negativeHex: string
  reactive: <T extends object>(target: T) => Reactive<T>
  resolveFaDuplicatePaletteIconQuasarColor: (
    backgroundHex: string,
    negativeHex: string,
    blackHex: string,
    minContrastRatio: number
  ) => T_faDialogProjectSettingsWorldColorPaletteDuplicateIconColor
  useFaColorPickerPopoverEmit: (
    props: { modelValue: string },
    emitModelValue: (value: string) => void
  ) => {
    onPickerChange: (value: string | null) => void
    onPickerMenuHide: () => void
    onPickerUpdate: (value: string | null) => void
    resolveLiveColorString: () => string
  }
  watch: (
    source: () => string,
    effect: (value: string) => void
  ) => void
}

/** Injected dependencies for useDialogProjectSettingsWorldColorPaletteEditor wiring. */
export type T_dialogProjectSettingsWorldColorPaletteEditorUseDeps = {
  VueDraggable: unknown
  appendDefaultHex: string
  appendDialogProjectSettingsWorldColorPaletteEntry: (
    entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[],
    createEntryId: () => string,
    appendHex: string
  ) => I_dialogProjectSettingsWorldColorPaletteEntry[]
  applyFaVerticalDraggableTabsDocumentDragCursor: () => void
  buildDialogProjectSettingsWorldColorPaletteEntries: (
    hexList: readonly string[],
    createEntryId: () => string
  ) => I_dialogProjectSettingsWorldColorPaletteEntry[]
  clearFaVerticalDraggableTabsDocumentDragCursor: () => void
  collectFaProjectWorldColorPalleteDuplicateHexKeys: (
    hexList: readonly string[]
  ) => ReadonlySet<string>
  computed: <T>(fn: () => T) => I_computedRef<T>
  createEntryId: () => string
  duplicateDialogProjectSettingsWorldColorPaletteEntryAfter: (
    entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[],
    entryId: string,
    createEntryId: () => string
  ) => I_dialogProjectSettingsWorldColorPaletteEntry[] | null
  faVerticalDraggableTabsSortableDragOptions: Record<string, unknown>
  hideNativeSortableDragGhost: (
    dataTransfer: DataTransfer,
    dragEl: HTMLElement
  ) => void
  paletteMaxLength: number
  parseFaProjectWorldColorPalleteToHexList: (
    colorPallete: string
  ) => string[]
  parseFaProjectWorldColorPalleteToHexListPreservingDuplicates: (
    colorPallete: string
  ) => string[]
  readFaSortableDragItemDataAttribute: (
    item: HTMLElement,
    attributeName: string
  ) => string | null
  ref: <T>(value: T) => I_ref<T>
  removeDialogProjectSettingsWorldColorPaletteEntry: (
    entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[],
    entryId: string
  ) => I_dialogProjectSettingsWorldColorPaletteEntry[] | null
  replaceDialogProjectSettingsWorldColorPaletteEntryHex: (
    entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[],
    entryId: string,
    hex: string
  ) => I_dialogProjectSettingsWorldColorPaletteEntry[]
  serializeFaProjectWorldColorPalleteFromHexList: (
    hexList: readonly string[]
  ) => string
  watch: (
    source: () => string,
    effect: (value: string) => void,
    options?: { immediate?: boolean }
  ) => void
  wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength: (
    entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[],
    entryId: string,
    serializeFaProjectWorldColorPalleteFromHexList: (
      hexList: readonly string[]
    ) => string,
    wouldFaProjectWorldColorPalleteExceedMaxLength: (
      colorPallete: string,
      appendHex: string,
      maxLength: number
    ) => boolean,
    maxLength: number
  ) => boolean
  wouldFaProjectWorldColorPalleteExceedMaxLength: (
    colorPallete: string,
    appendHex: string,
    maxLength: number
  ) => boolean
}

/** Worlds list hydrated for Project Settings (includes per-world document counts). */
export interface I_faProjectWorldForProjectSettings {
  id: string
  displayName: string
  color: string
  colorPallete: string
  sortOrder: number
  createdAtMs: number
  updatedAtMs: number
  documentCount: number
}

export interface I_faProjectWorldsForProjectSettingsResult {
  items: I_faProjectWorldForProjectSettings[]
}

/** Seconds before Confirm delete is enabled in Project Settings world delete menu. */
export const FA_DIALOG_PROJECT_SETTINGS_WORLD_DELETE_CONFIRM_DELAY_SEC = 5

/** Flattened save-validation tooltip for tests and data-test-tooltip-text. */
export interface I_dialogProjectSettingsSaveValidationTooltipContent {
  bullets: string[]
  flatText: string
  intro: string
}

/** World color palette field help tooltip for structured markup and data-test-tooltip-text. */
export interface I_dialogProjectSettingsWorldColorPaletteTooltipContent {
  deletionBullet: string
  duplicationBullet: string
  flatText: string
  intro: string
  rightClickIntro: string
}

/** Save-blocking validation error kinds for Project Settings. */
export type T_dialogProjectSettingsSaveValidationErrorKind =
  | 'documentTemplateNameRequired'
  | 'duplicatePaletteColors'
  | 'projectNameRequired'
  | 'worldNameRequired'

/** One ordered save-validation error in the Project Settings draft. */
export interface I_dialogProjectSettingsSaveValidationError {
  kind: T_dialogProjectSettingsSaveValidationErrorKind
  templateIndexOneBased?: number
  worldIndexOneBased?: number
}
