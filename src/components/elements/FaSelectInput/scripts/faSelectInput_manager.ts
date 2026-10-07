import { computed, nextTick, ref } from 'vue'

import { FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON } from 'app/types/I_faIconPickerInput'
import {
  FA_SELECT_INPUT_DEFAULT_CHIP_COLOR,
  FA_SELECT_INPUT_NEW_CHIP_COLOR
} from 'app/types/I_faSelectInput'

import { buildFaColorGlyphCssCustomProperties } from 'app/src/scripts/faColorContrast/faColorContrast_manager'
import { shouldAcceptFaEnterOutsideIme } from 'app/src/scripts/dom/dom_manager'
import {
  appendFaSelectInputCreatedValue,
  bindFaSelectInputOptionItemActivateProps,
  clearFaSelectInputIsNewFlags,
  createBuildFaSelectInputOptionIconStyle,
  createFaSelectInputChangePayload,
  createFaSelectInputNewItem,
  filterFaSelectInputOptionsByQuery,
  isFaSelectInputObjectMode,
  normalizeFaSelectInputOptions,
  resolveFaSelectInputEnterActivateOption,
  resolveFaSelectInputOptionIcon,
  shouldShowFaSelectInputSelectedChip,
  splitFaSelectInputLabelForFilterHighlight,
  stripFaSelectInputOptionItemActiveClass
} from 'app/src/scripts/faSelectInput/faSelectInput_manager'

import { createFaSelectInputApi } from './functions/createFaSelectInputApi'
import { createUseFaSelectInput } from './functions/createUseFaSelectInput'
import {
  resolveFaSelectInputObjectOptionLabel,
  resolveFaSelectInputOptionIconClass,
  resolveFaSelectInputOptionIconStyle,
  shouldShowFaSelectInputInlineSelection
} from './functions/faSelectInputPresentation'

export const shouldActivateFaSelectInputOnEnter = shouldAcceptFaEnterOutsideIme

export {
  bindFaSelectInputOptionItemActivateProps,
  resolveFaSelectInputObjectOptionLabel,
  resolveFaSelectInputOptionIconClass,
  resolveFaSelectInputOptionIconStyle,
  shouldShowFaSelectInputInlineSelection,
  shouldShowFaSelectInputSelectedChip,
  stripFaSelectInputOptionItemActiveClass
}

export const buildFaSelectInputOptionIconStyle = createBuildFaSelectInputOptionIconStyle({
  buildFaColorGlyphCssCustomProperties
})

export const useFaSelectInput = createUseFaSelectInput({
  appendFaSelectInputCreatedValue,
  clearFaSelectInputIsNewFlags,
  computed,
  createFaSelectInputChangePayload,
  createFaSelectInputNewItem,
  createId: () => crypto.randomUUID(),
  defaultChipColor: FA_SELECT_INPUT_DEFAULT_CHIP_COLOR,
  emptyDocumentTemplateIcon: FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON,
  filterFaSelectInputOptionsByQuery,
  isFaSelectInputObjectMode,
  newChipColor: FA_SELECT_INPUT_NEW_CHIP_COLOR,
  nextTick,
  normalizeFaSelectInputOptions,
  ref,
  resolveFaSelectInputEnterActivateOption,
  resolveFaSelectInputOptionIcon,
  shouldActivateFaSelectInputOnEnter,
  splitFaSelectInputLabelForFilterHighlight
}, createFaSelectInputApi)
