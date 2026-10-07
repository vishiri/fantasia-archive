import type { T_faColorPickerInputPalette } from 'app/types/I_faColorPickerInput'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

export function createUseFaColorPickerInput (deps: {
  computed: <T>(fn: () => T) => I_computedRef<T>
  useFaProjectWorldColorPaletteFromBridge: (options: {
    enabled: I_computedRef<boolean>
  }) => {
    paletteHexList: I_ref<string[]>
    refreshPaletteFromBridge: () => Promise<void>
  }
  useFaColorPickerInputPickerEmit: (
    props: { modelValue: string },
    emitModelValue: (value: string) => void
  ) => {
    applyTextModelValue: (value: string) => void
    onPickerChange: (value: string | null) => void
    onPickerMenuHide: () => void
    onPickerUpdate: (value: string | null) => void
    resolveLiveColorString: () => string
  }
}): (props: {
    defaultHex: string
    modelValue: string
    palette?: T_faColorPickerInputPalette | undefined
  }, emitModelValue: (value: string) => void) => {
    colorSwatchStyle: I_computedRef<{ backgroundColor: string }>
    displayHex: I_computedRef<string>
    hasPaletteFooter: I_computedRef<boolean>
    isSwatchEmpty: I_computedRef<boolean>
    menuOffset: I_computedRef<[number, number]>
    applyTextModelValue: (value: string) => void
    onPickerChange: (value: string | null) => void
    onPickerMenuHide: () => void
    onPickerUpdate: (value: string | null) => void
    refreshProjectColorPalette: () => Promise<void>
    resolveLiveColorString: () => string
    resolvedPalette: I_computedRef<readonly string[]>
  } {
  return function useFaColorPickerInput (
    props: {
      defaultHex: string
      modelValue: string
      palette?: T_faColorPickerInputPalette | undefined
    },
    emitModelValue: (value: string) => void
  ) {
    const bridgePalette = deps.useFaProjectWorldColorPaletteFromBridge({
      enabled: deps.computed(() => props.palette === undefined)
    })

    const pickerEmit = deps.useFaColorPickerInputPickerEmit(props, emitModelValue)

    const resolvedPalette = deps.computed(() => {
      if (props.palette !== undefined) {
        return props.palette
      }
      return bridgePalette.paletteHexList.value
    })

    const hasPaletteFooter = deps.computed(() => resolvedPalette.value.length > 0)

    const isSwatchEmpty = deps.computed(() => pickerEmit.resolveLiveColorString().trim().length === 0)

    const displayHex = deps.computed(() => {
      const trimmed = pickerEmit.resolveLiveColorString().trim()
      if (trimmed.length === 0) {
        return props.defaultHex
      }
      return trimmed
    })

    const colorSwatchStyle = deps.computed(() => {
      const backgroundColor = pickerEmit.resolveLiveColorString().trim()
      return {
        backgroundColor
      }
    })

    const menuOffset = deps.computed(() => [0, 4] as [number, number])

    const {
      applyTextModelValue,
      onPickerChange,
      onPickerMenuHide,
      onPickerUpdate,
      resolveLiveColorString
    } = pickerEmit
    const refreshProjectColorPalette = bridgePalette.refreshPaletteFromBridge
    return {
      applyTextModelValue,
      colorSwatchStyle,
      displayHex,
      hasPaletteFooter,
      isSwatchEmpty,
      menuOffset,
      onPickerChange,
      onPickerMenuHide,
      onPickerUpdate,
      refreshProjectColorPalette,
      resolveLiveColorString,
      resolvedPalette
    }
  }
}
