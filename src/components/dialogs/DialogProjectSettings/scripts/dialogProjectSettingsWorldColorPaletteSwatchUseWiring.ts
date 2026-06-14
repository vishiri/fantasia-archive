import type { T_faColorPickerInputPalette } from 'app/types/I_faColorPickerInput'
import type {
  I_dialogProjectSettingsWorldColorPaletteSwatchApi,
  T_dialogProjectSettingsWorldColorPaletteSwatchUseDeps
} from 'app/types/I_dialogProjectSettingsWorlds'

import { useDialogProjectSettingsWorldColorPaletteSwatchImpl } from './dialogProjectSettingsWorldColorPaletteSwatchUseImpl'

export function createUseDialogProjectSettingsWorldColorPaletteSwatch (
  deps: T_dialogProjectSettingsWorldColorPaletteSwatchUseDeps
): (
    props: {
      duplicateHexKeys: ReadonlySet<string>
      hex: string
      pickerOpen: boolean
      worldPickerPalette: T_faColorPickerInputPalette
    },
    emit: {
      (event: 'update:hex', value: string): void
      (event: 'picker-close'): void
    }
  ) => I_dialogProjectSettingsWorldColorPaletteSwatchApi {
  return function useDialogProjectSettingsWorldColorPaletteSwatch (props, emit) {
    return useDialogProjectSettingsWorldColorPaletteSwatchImpl(deps, props, emit)
  }
}
