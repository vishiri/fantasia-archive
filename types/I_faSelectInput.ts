/**
 * Reusable FaSelectInput (QSelect wrapper) contracts.
 * Mode is required; media is a typed stub until implemented.
 */

export type T_faSelectInputMode =
  | 'simple'
  | 'document'
  | 'otherType'
  | 'tags'
  | 'media'

/** Object option / selection item for non-simple modes. */
export interface I_faSelectInputObjectItem {
  id: string
  name: string
  documentType?: string
  icon?: string
  isNew?: boolean
  otherType?: string
}

export type T_faSelectInputSimpleValue = string
export type T_faSelectInputSimpleModel = string | string[]
export type T_faSelectInputObjectModel =
  | I_faSelectInputObjectItem
  | I_faSelectInputObjectItem[]
  | null

export type T_faSelectInputModelValue =
  | T_faSelectInputSimpleModel
  | T_faSelectInputObjectModel

export type T_faSelectInputOption =
  | T_faSelectInputSimpleValue
  | I_faSelectInputObjectItem

export type T_faSelectInputOptions = readonly T_faSelectInputOption[]

export type T_faSelectInputFilterFn = (
  needle: string,
  items: readonly T_faSelectInputOption[]
) => T_faSelectInputOption[]

/** One span of option label text for filter match highlighting. */
export type T_faSelectInputLabelHighlightSegment = {
  isMatch: boolean
  text: string
}

export type T_faSelectInputChangeAction = 'add' | 'remove' | 'replace'

export interface I_faSelectInputChangePayload {
  action: T_faSelectInputChangeAction
  value: T_faSelectInputModelValue
}

export type T_faSelectInputObjectMode = Exclude<T_faSelectInputMode, 'simple' | 'media'>

export const FA_SELECT_INPUT_OBJECT_MODES: readonly T_faSelectInputObjectMode[] = [
  'document',
  'otherType',
  'tags'
]

export const FA_SELECT_INPUT_NEW_CHIP_COLOR = 'teal-3'

/** Quasar color name for normal chips (FA1 accent). */
export const FA_SELECT_INPUT_DEFAULT_CHIP_COLOR = 'accent'

/** Quasar text-color on chips (FA1 dark on accent/teal). */
export const FA_SELECT_INPUT_CHIP_TEXT_COLOR = 'dark'

/** Deps injected into createUseFaSelectInput. */
export interface I_faSelectInputUseDeps {
  appendFaSelectInputCreatedValue: (
    modelValue: T_faSelectInputModelValue,
    created: string | I_faSelectInputObjectItem,
    multiple: boolean
  ) => T_faSelectInputModelValue
  clearFaSelectInputIsNewFlags: (
    modelValue: T_faSelectInputModelValue,
    ids: readonly string[]
  ) => T_faSelectInputModelValue
  computed: <T>(fn: () => T) => import('app/types/I_vueCompositionShims').I_computedRef<T>
  createFaSelectInputChangePayload: (
    previousValue: T_faSelectInputModelValue,
    nextValue: T_faSelectInputModelValue,
    multiple: boolean
  ) => I_faSelectInputChangePayload
  createFaSelectInputNewItem: (
    mode: T_faSelectInputMode,
    typedText: string,
    createId: () => string
  ) => string | I_faSelectInputObjectItem | null
  createId: () => string
  defaultChipColor: string
  filterFaSelectInputOptionsByQuery: T_faSelectInputFilterFn
  isFaSelectInputObjectMode: (mode: T_faSelectInputMode) => boolean
  newChipColor: string
  nextTick: (fn?: () => void) => Promise<void>
  normalizeFaSelectInputOptions: (
    mode: T_faSelectInputMode,
    options: T_faSelectInputOptions
  ) => T_faSelectInputOption[]
  ref: <T>(value: T) => import('app/types/I_vueCompositionShims').I_ref<T>
  splitFaSelectInputLabelForFilterHighlight: (
    label: string,
    needle: string
  ) => T_faSelectInputLabelHighlightSegment[]
}

/** Parent/prop accessors + emits for FaSelectInput composable. */
export interface I_faSelectInputUseInput {
  emitChange: (payload: I_faSelectInputChangePayload) => void
  emitModelValue: (value: T_faSelectInputModelValue) => void
  emitNewValue: (value: string | I_faSelectInputObjectItem) => void
  emitRequestOptions: () => void
  getAllowCreateNew: () => boolean
  getClearInputOnSelect: () => boolean
  getFilterFn: () => T_faSelectInputFilterFn | undefined
  getMode: () => T_faSelectInputMode
  getModelValue: () => T_faSelectInputModelValue
  getMultiple: () => boolean
  getOptions: () => T_faSelectInputOptions
}
