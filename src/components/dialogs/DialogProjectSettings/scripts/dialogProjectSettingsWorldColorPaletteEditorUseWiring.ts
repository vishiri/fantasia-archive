import type {
  I_dialogProjectSettingsWorldColorPaletteEditorApi,
  T_dialogProjectSettingsWorldColorPaletteEditorUseDeps
} from 'app/types/I_dialogProjectSettingsWorlds'

import { useDialogProjectSettingsWorldColorPaletteEditorRuntime } from './dialogProjectSettingsWorldColorPaletteEditorUseRuntime'

export function createUseDialogProjectSettingsWorldColorPaletteEditor (
  deps: T_dialogProjectSettingsWorldColorPaletteEditorUseDeps
): (
    props: {
      colorPallete: string
    },
    emit: {
      (event: 'update:colorPallete', value: string): void
    }
  ) => I_dialogProjectSettingsWorldColorPaletteEditorApi {
  return function useDialogProjectSettingsWorldColorPaletteEditor (props, emit) {
    return useDialogProjectSettingsWorldColorPaletteEditorRuntime(deps, props, emit)
  }
}
