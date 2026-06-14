import type { T_faColorPickerInputPalette } from 'app/types/I_faColorPickerInput'
import type {
  I_dialogProjectSettingsWorldColorPaletteSwatchApi,
  T_dialogProjectSettingsWorldColorPaletteSwatchUseDeps
} from 'app/types/I_dialogProjectSettingsWorlds'

export function useDialogProjectSettingsWorldColorPaletteSwatchImpl (
  deps: T_dialogProjectSettingsWorldColorPaletteSwatchUseDeps,
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
): I_dialogProjectSettingsWorldColorPaletteSwatchApi {
  const pickerModel = deps.reactive({
    modelValue: props.hex
  })

  deps.watch(() => props.hex, (hex) => {
    pickerModel.modelValue = hex
  })

  const pickerEmit = deps.useFaColorPickerPopoverEmit(pickerModel, (value) => {
    emit('update:hex', value)
  })

  const isDuplicate = deps.computed(() => {
    return deps.isDialogProjectSettingsWorldColorPaletteSwatchDuplicate(
      props.hex,
      props.duplicateHexKeys
    )
  })

  const duplicateIconColor = deps.computed(() => {
    if (!isDuplicate.value) {
      return 'negative'
    }
    return deps.resolveFaDuplicatePaletteIconQuasarColor(
      props.hex,
      deps.negativeHex,
      deps.blackHex,
      deps.duplicateIconMinContrastRatio
    )
  })

  const tooltipHex = deps.computed(() => props.hex.trim().toUpperCase())

  const displayHex = deps.computed(() => {
    const trimmed = pickerEmit.resolveLiveColorString().trim()
    if (trimmed.length === 0) {
      return '#FFFFFF'
    }
    return trimmed
  })

  const swatchStyle = deps.computed(() => ({
    backgroundColor: props.hex.trim()
  }))

  const hasPaletteFooter = deps.computed(() => props.worldPickerPalette.length > 0)

  const menuOffset = deps.computed(() => [0, 4] as [number, number])

  function onPickerMenuHide (): void {
    pickerEmit.onPickerMenuHide()
    if (props.pickerOpen) {
      emit('picker-close')
    }
  }

  function onPickerChange (value: string | null): void {
    pickerEmit.onPickerChange(value)
  }

  function onPickerUpdate (value: string | null): void {
    pickerEmit.onPickerUpdate(value)
  }

  return {
    displayHex,
    duplicateIconColor,
    hasPaletteFooter,
    isDuplicate,
    menuOffset,
    onPickerChange,
    onPickerMenuHide,
    onPickerUpdate,
    swatchStyle,
    tooltipHex
  }
}
