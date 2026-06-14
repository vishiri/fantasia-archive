import throttle from 'lodash-es/throttle.js'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'

import { FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS } from 'app/types/I_faColorPickerInput'
import {
  FA_COLOR_CONTRAST_BLACK_HEX,
  FA_COLOR_CONTRAST_NEGATIVE_HEX,
  FA_DIALOG_PROJECT_SETTINGS_WORLD_COLOR_PALETTE_DUPLICATE_ICON_MIN_CONTRAST_RATIO
} from 'app/types/I_faColorContrast'
import { createFaColorPickerPopoverEmit } from 'app/src/scripts/faColorPicker/functions/createFaColorPickerPopoverEmit'
import { resolveFaDuplicatePaletteIconQuasarColor } from 'app/src/scripts/faColorContrast/functions/faColorContrast'

import { isDialogProjectSettingsWorldColorPaletteSwatchDuplicate } from './functions/dialogProjectSettingsWorldColorPalette'
import { createUseDialogProjectSettingsWorldColorPaletteSwatch } from './dialogProjectSettingsWorldColorPaletteSwatchUseWiring'

const useFaColorPickerPopoverEmit = createFaColorPickerPopoverEmit({
  onUnmounted,
  ref,
  throttle,
  throttleMs: FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS,
  watch
})

export const useDialogProjectSettingsWorldColorPaletteSwatch =
  createUseDialogProjectSettingsWorldColorPaletteSwatch({
    blackHex: FA_COLOR_CONTRAST_BLACK_HEX,
    computed,
    duplicateIconMinContrastRatio:
      FA_DIALOG_PROJECT_SETTINGS_WORLD_COLOR_PALETTE_DUPLICATE_ICON_MIN_CONTRAST_RATIO,
    isDialogProjectSettingsWorldColorPaletteSwatchDuplicate,
    negativeHex: FA_COLOR_CONTRAST_NEGATIVE_HEX,
    reactive,
    resolveFaDuplicatePaletteIconQuasarColor,
    useFaColorPickerPopoverEmit,
    watch
  })
