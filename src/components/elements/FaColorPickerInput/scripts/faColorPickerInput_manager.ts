import throttle from 'lodash-es/throttle.js'
import { computed, onUnmounted, ref, watch } from 'vue'

import { FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS } from 'app/types/I_faColorPickerInput'
import { FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH } from 'app/types/I_faProjectWorldDomain'
import { createFaColorPickerPopoverEmit } from 'app/src/scripts/faColorPicker/functions/createFaColorPickerPopoverEmit'
import {
  appendFaProjectWorldColorPalleteHex,
  faProjectWorldColorPalleteContainsHex,
  isFaProjectWorldStorageHexColor
} from 'app/src/scripts/projectWorlds/functions/faProjectWorldColorPalleteHexList'
import { useFaProjectWorldColorPaletteFromBridge } from 'app/src/scripts/projectWorlds/faProjectWorldColorPalette_manager'

import { faColorPickerInputPaletteAppendWiring } from './faColorPickerInputPaletteAppendWiring'
import { createUseFaColorPickerInput } from './functions/createUseFaColorPickerInput'
import { createUseFaColorPickerPaletteAppend } from './functions/createUseFaColorPickerPaletteAppend'
import { readFaColorPickerPaletteAppendWorldId } from './functions/faColorPickerPaletteAppendWorldId'
import {
  isFaColorPickerPaletteAppendDisabled,
  isFaColorPickerPaletteAppendDuplicate,
  runFaColorPickerPaletteAppendClick
} from './functions/faColorPickerPaletteAppendState'

export const useFaColorPickerInput = createUseFaColorPickerInput({
  computed,
  useFaColorPickerInputPickerEmit: createFaColorPickerPopoverEmit({
    onUnmounted,
    ref,
    throttle,
    throttleMs: FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS,
    watch
  }),
  useFaProjectWorldColorPaletteFromBridge
})

export const useFaColorPickerPaletteAppend = createUseFaColorPickerPaletteAppend({
  appendFaProjectWorldColorPalleteHex,
  computed,
  faProjectWorldColorPalleteContainsHex,
  isFaColorPickerPaletteAppendDisabled,
  isFaColorPickerPaletteAppendDuplicate,
  isFaProjectWorldStorageHexColor,
  paletteMaxLength: FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
  persistWorldColorPalette: faColorPickerInputPaletteAppendWiring.persistWorldColorPalette,
  readFaColorPickerPaletteAppendWorldId,
  refreshProjectWorldColorPalette: faColorPickerInputPaletteAppendWiring.noopRefreshProjectColorPalette,
  runFaColorPickerPaletteAppendClick
})
