import type {
  I_faColorPickerPaletteAppendConfig,
  T_createUseFaColorPickerPaletteAppendDeps
} from 'app/types/I_faColorPickerInput'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function createUseFaColorPickerPaletteAppend (
  deps: T_createUseFaColorPickerPaletteAppendDeps
): (props: {
    modelValue: string
    paletteAppend?: I_faColorPickerPaletteAppendConfig
  }, emitAppendToWorldPalette: (colorPallete: string) => void, resolveLiveColorString: () => string, refreshProjectColorPalette?: () => Promise<void>) => {
    isPaletteAppendDisabled: I_computedRef<boolean>
    isPaletteAppendDuplicate: I_computedRef<boolean>
    onPaletteAppendClick: () => Promise<void>
    showPaletteAppendButton: I_computedRef<boolean>
  } {
  return function useFaColorPickerPaletteAppend (
    props: {
      modelValue: string
      paletteAppend?: I_faColorPickerPaletteAppendConfig
    },
    emitAppendToWorldPalette: (colorPallete: string) => void,
    resolveLiveColorString: () => string,
    refreshProjectColorPalette?: () => Promise<void>
  ) {
    const showPaletteAppendButton = deps.computed(() => props.paletteAppend !== undefined)

    const appendHexCandidate = deps.computed(() => resolveLiveColorString().trim())

    const isPaletteAppendDuplicate = deps.computed(() => {
      return deps.isFaColorPickerPaletteAppendDuplicate(
        props.paletteAppend,
        appendHexCandidate.value,
        deps.faProjectWorldColorPalleteContainsHex,
        deps.isFaProjectWorldStorageHexColor
      )
    })

    const isPaletteAppendDisabled = deps.computed(() => {
      return deps.isFaColorPickerPaletteAppendDisabled(
        props.paletteAppend,
        appendHexCandidate.value,
        deps.appendFaProjectWorldColorPalleteHex,
        deps.faProjectWorldColorPalleteContainsHex,
        deps.isFaProjectWorldStorageHexColor,
        deps.paletteMaxLength,
        deps.readFaColorPickerPaletteAppendWorldId
      )
    })

    async function onPaletteAppendClick (): Promise<void> {
      const config = props.paletteAppend
      if (config === undefined || isPaletteAppendDisabled.value) {
        return
      }
      await deps.runFaColorPickerPaletteAppendClick(
        config,
        appendHexCandidate.value,
        deps.appendFaProjectWorldColorPalleteHex,
        deps.paletteMaxLength,
        deps.persistWorldColorPalette,
        deps.readFaColorPickerPaletteAppendWorldId,
        deps.refreshProjectWorldColorPalette,
        emitAppendToWorldPalette,
        refreshProjectColorPalette
      )
    }

    return {
      isPaletteAppendDisabled,
      isPaletteAppendDuplicate,
      onPaletteAppendClick,
      showPaletteAppendButton
    }
  }
}
