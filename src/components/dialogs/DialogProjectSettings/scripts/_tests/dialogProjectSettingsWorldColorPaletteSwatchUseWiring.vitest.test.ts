import { computed, reactive, ref, watch } from 'vue'
import { expect, test } from 'vitest'

import { createFaColorPickerPopoverEmit } from 'app/src/scripts/faColorPicker/functions/createFaColorPickerPopoverEmit'
import { resolveFaDuplicatePaletteIconQuasarColor } from 'app/src/scripts/faColorContrast/functions/faColorContrast'
import { FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS } from 'app/types/I_faColorPickerInput'
import {
  FA_COLOR_CONTRAST_BLACK_HEX,
  FA_COLOR_CONTRAST_NEGATIVE_HEX,
  FA_DIALOG_PROJECT_SETTINGS_WORLD_COLOR_PALETTE_DUPLICATE_ICON_MIN_CONTRAST_RATIO
} from 'app/types/I_faColorContrast'
import throttle from 'lodash-es/throttle.js'
import { onUnmounted } from 'vue'

import { isDialogProjectSettingsWorldColorPaletteSwatchDuplicate } from '../functions/dialogProjectSettingsWorldColorPalette'
import { createUseDialogProjectSettingsWorldColorPaletteSwatch } from '../dialogProjectSettingsWorldColorPaletteSwatchUseWiring'

const useFaColorPickerPopoverEmit = createFaColorPickerPopoverEmit({
  onUnmounted,
  ref,
  throttle,
  throttleMs: FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS,
  watch
})

const useSwatch = createUseDialogProjectSettingsWorldColorPaletteSwatch({
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

function createPaletteSwatchTestEmit (
  emitted: Array<string | []>,
  props: { hex: string }
): {
    (event: 'update:hex', value: string): void
    (event: 'picker-close'): void
  } {
  const emit = ((event: 'update:hex' | 'picker-close', value?: string) => {
    if (event === 'update:hex' && value !== undefined) {
      emitted.push(value)
      props.hex = value
      return
    }
    if (event === 'picker-close') {
      emitted.push([])
    }
  }) as {
    (event: 'update:hex', value: string): void
    (event: 'picker-close'): void
  }
  return emit
}

const noopPaletteSwatchEmit = (() => undefined) as {
  (event: 'update:hex', value: string): void
  (event: 'picker-close'): void
}

/**
 * createUseDialogProjectSettingsWorldColorPaletteSwatch
 * Emits hex updates and picker-close from picker handlers.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteSwatch wires picker emit handlers', () => {
  const emitted: Array<string | []> = []
  const props = reactive({
    duplicateHexKeys: new Set<string>(),
    hex: '#112233',
    pickerOpen: true,
    worldPickerPalette: ['#112233']
  })
  const api = useSwatch(props, createPaletteSwatchTestEmit(emitted, props))

  expect(api.isDuplicate.value).toBe(false)
  expect(api.duplicateIconColor.value).toBe('negative')
  expect(api.tooltipHex.value).toBe('#112233')

  api.onPickerUpdate('#445566')
  api.onPickerChange('#445566')
  api.onPickerMenuHide()

  expect(emitted).toContain('#445566')
  expect(emitted).toContainEqual([])
})

/**
 * createUseDialogProjectSettingsWorldColorPaletteSwatch
 * Marks duplicate swatches using the duplicate key set.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteSwatch reports duplicate swatches', () => {
  const props = reactive({
    duplicateHexKeys: new Set(['#112233']),
    hex: '#112233',
    pickerOpen: false,
    worldPickerPalette: [] as string[]
  })
  const api = useSwatch(props, noopPaletteSwatchEmit)
  expect(api.isDuplicate.value).toBe(true)
})

/**
 * createUseDialogProjectSettingsWorldColorPaletteSwatch
 * Skips picker-close when the parent already cleared pickerOpen before menu hide.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteSwatch skips picker-close when pickerOpen is false', () => {
  const emitted: Array<[]> = []
  const props = reactive({
    duplicateHexKeys: new Set<string>(),
    hex: '#112233',
    pickerOpen: false,
    worldPickerPalette: [] as string[]
  })
  const emit = ((event: 'picker-close') => {
    if (event === 'picker-close') {
      emitted.push([])
    }
  }) as {
    (event: 'update:hex', value: string): void
    (event: 'picker-close'): void
  }
  const api = useSwatch(props, emit)
  api.onPickerMenuHide()
  expect(emitted).toHaveLength(0)
})

/**
 * createUseDialogProjectSettingsWorldColorPaletteSwatch
 * Picks black duplicate icon color on low-contrast red swatches.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteSwatch picks black icon on red swatches', () => {
  const props = reactive({
    duplicateHexKeys: new Set(['#ff0000']),
    hex: '#ff0000',
    pickerOpen: false,
    worldPickerPalette: [] as string[]
  })
  const api = useSwatch(props, noopPaletteSwatchEmit)
  expect(api.duplicateIconColor.value).toBe('black')
})

/**
 * createUseDialogProjectSettingsWorldColorPaletteSwatch
 * Falls back display hex to white when the live picker value is empty.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteSwatch falls back display hex to white', () => {
  const props = reactive({
    duplicateHexKeys: new Set<string>(),
    hex: '   ',
    pickerOpen: false,
    worldPickerPalette: [] as string[]
  })
  const api = useSwatch(props, noopPaletteSwatchEmit)
  expect(api.displayHex.value).toBe('#FFFFFF')
  expect(api.hasPaletteFooter.value).toBe(false)
  expect(api.swatchStyle.value.backgroundColor).toBe('')
})
