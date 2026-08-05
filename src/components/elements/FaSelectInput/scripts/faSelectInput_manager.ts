import { computed, nextTick, ref } from 'vue'

import {
  FA_SELECT_INPUT_DEFAULT_CHIP_COLOR,
  FA_SELECT_INPUT_NEW_CHIP_COLOR
} from 'app/types/I_faSelectInput'

import {
  appendFaSelectInputCreatedValue,
  clearFaSelectInputIsNewFlags,
  createFaSelectInputChangePayload,
  createFaSelectInputNewItem,
  filterFaSelectInputOptionsByQuery,
  isFaSelectInputObjectMode,
  normalizeFaSelectInputOptions,
  shouldShowFaSelectInputSelectedChip,
  splitFaSelectInputLabelForFilterHighlight
} from 'app/src/scripts/faSelectInput/faSelectInput_manager'

import { createUseFaSelectInput } from './functions/createUseFaSelectInput'

export { shouldShowFaSelectInputSelectedChip }

export const useFaSelectInput = createUseFaSelectInput({
  appendFaSelectInputCreatedValue,
  clearFaSelectInputIsNewFlags,
  computed,
  createFaSelectInputChangePayload,
  createFaSelectInputNewItem,
  createId: () => crypto.randomUUID(),
  defaultChipColor: FA_SELECT_INPUT_DEFAULT_CHIP_COLOR,
  filterFaSelectInputOptionsByQuery,
  isFaSelectInputObjectMode,
  newChipColor: FA_SELECT_INPUT_NEW_CHIP_COLOR,
  nextTick,
  normalizeFaSelectInputOptions,
  ref,
  splitFaSelectInputLabelForFilterHighlight
})
