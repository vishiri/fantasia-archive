import { computed, reactive } from 'vue'
import { expect, test, vi } from 'vitest'

import { FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH } from 'app/types/I_faProjectWorldDomain'
import {
  appendFaProjectWorldColorPalleteHex,
  faProjectWorldColorPalleteContainsHex,
  isFaProjectWorldStorageHexColor
} from 'app/src/scripts/projectWorlds/functions/faProjectWorldColorPalleteHexList'

import { readFaColorPickerPaletteAppendWorldId } from '../functions/faColorPickerPaletteAppendWorldId'
import {
  isFaColorPickerPaletteAppendDisabled,
  isFaColorPickerPaletteAppendDuplicate,
  runFaColorPickerPaletteAppendClick
} from '../functions/faColorPickerPaletteAppendState'

import { createUseFaColorPickerPaletteAppend } from '../functions/createUseFaColorPickerPaletteAppend'

const paletteAppendFactoryDeps = {
  appendFaProjectWorldColorPalleteHex,
  computed,
  faProjectWorldColorPalleteContainsHex,
  isFaColorPickerPaletteAppendDisabled,
  isFaColorPickerPaletteAppendDuplicate,
  isFaProjectWorldStorageHexColor,
  paletteMaxLength: FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
  persistWorldColorPalette: vi.fn(async () => true),
  readFaColorPickerPaletteAppendWorldId,
  refreshProjectWorldColorPalette: vi.fn(async () => undefined),
  runFaColorPickerPaletteAppendClick
}

const usePaletteAppend = createUseFaColorPickerPaletteAppend(paletteAppendFactoryDeps)

/**
 * createUseFaColorPickerPaletteAppend
 * Emits the next palette string in draft mode without persisting.
 */
test('Test that createUseFaColorPickerPaletteAppend emits draft palette updates', async () => {
  const emitted: string[] = []
  const props = reactive({
    modelValue: '#112233',
    paletteAppend: {
      mode: 'draft' as const,
      worldColorPalette: '#445566'
    }
  })
  const api = usePaletteAppend(
    props,
    (colorPallete) => {
      emitted.push(colorPallete)
    },
    () => props.modelValue
  )

  expect(api.showPaletteAppendButton.value).toBe(true)
  expect(api.isPaletteAppendDisabled.value).toBe(false)

  await api.onPaletteAppendClick()

  expect(emitted).toEqual(['#445566;#112233'])
})

/**
 * createUseFaColorPickerPaletteAppend
 * Disables append when the hex is blank, invalid, or already in the palette.
 */
test('Test that createUseFaColorPickerPaletteAppend disables invalid append candidates', () => {
  const props = reactive({
    modelValue: '#112233',
    paletteAppend: {
      mode: 'draft' as const,
      worldColorPalette: '#112233'
    }
  })
  const duplicateApi = usePaletteAppend(props, () => undefined, () => props.modelValue)
  expect(duplicateApi.isPaletteAppendDisabled.value).toBe(true)
  expect(duplicateApi.isPaletteAppendDuplicate.value).toBe(true)

  props.modelValue = 'not-a-color'
  const invalidApi = usePaletteAppend(props, () => undefined, () => props.modelValue)
  expect(invalidApi.isPaletteAppendDisabled.value).toBe(true)
  expect(invalidApi.isPaletteAppendDuplicate.value).toBe(false)

  props.modelValue = '   '
  const blankApi = usePaletteAppend(props, () => undefined, () => props.modelValue)
  expect(blankApi.isPaletteAppendDisabled.value).toBe(true)
  expect(blankApi.isPaletteAppendDuplicate.value).toBe(false)
})

/**
 * createUseFaColorPickerPaletteAppend
 * Persists palette updates when append mode is persist.
 */
test('Test that createUseFaColorPickerPaletteAppend persists palette updates', async () => {
  const persistWorldColorPalette = vi.fn(async () => true)
  const refreshProjectWorldColorPalette = vi.fn(async () => undefined)
  const usePersistAppend = createUseFaColorPickerPaletteAppend({
    ...paletteAppendFactoryDeps,
    persistWorldColorPalette,
    refreshProjectWorldColorPalette
  })
  const emitted: string[] = []
  const props = reactive({
    modelValue: '#aabbcc',
    paletteAppend: {
      mode: 'persist' as const,
      worldColorPalette: '#112233',
      worldId: 'world-1'
    }
  })
  const api = usePersistAppend(
    props,
    (colorPallete) => {
      emitted.push(colorPallete)
    },
    () => props.modelValue,
    refreshProjectWorldColorPalette
  )

  await api.onPaletteAppendClick()

  expect(persistWorldColorPalette).toHaveBeenCalledWith('world-1', '#112233;#AABBCC')
  expect(refreshProjectWorldColorPalette).toHaveBeenCalled()
  expect(emitted).toEqual(['#112233;#AABBCC'])
})

/**
 * createUseFaColorPickerPaletteAppend
 * Hides the append control when paletteAppend is not configured.
 */
test('Test that createUseFaColorPickerPaletteAppend hides without paletteAppend config', () => {
  const props = reactive({
    modelValue: '#112233',
    paletteAppend: undefined
  })
  const api = usePaletteAppend(props, () => undefined, () => props.modelValue)
  expect(api.showPaletteAppendButton.value).toBe(false)
  expect(api.isPaletteAppendDisabled.value).toBe(true)
})

/**
 * createUseFaColorPickerPaletteAppend
 * No-ops when paletteAppend is undefined at click time.
 */
test('Test that createUseFaColorPickerPaletteAppend no-ops without paletteAppend config', async () => {
  const emitted: string[] = []
  const props = reactive({
    modelValue: '#112233',
    paletteAppend: undefined
  })
  const api = usePaletteAppend(
    props,
    (colorPallete) => {
      emitted.push(colorPallete)
    },
    () => props.modelValue
  )
  await api.onPaletteAppendClick()
  expect(emitted).toHaveLength(0)
})

/**
 * createUseFaColorPickerPaletteAppend
 * Disables persist append when worldId is missing.
 */
test('Test that createUseFaColorPickerPaletteAppend disables persist without worldId', () => {
  const props = reactive({
    modelValue: '#aabbcc',
    paletteAppend: {
      mode: 'persist' as const,
      worldColorPalette: '#112233'
    }
  })
  const api = usePaletteAppend(props, () => undefined, () => props.modelValue)
  expect(api.isPaletteAppendDisabled.value).toBe(true)
})

/**
 * createUseFaColorPickerPaletteAppend
 * Disables append when the palette length cap would be exceeded.
 */
test('Test that createUseFaColorPickerPaletteAppend disables when palette length cap is exceeded', () => {
  const props = reactive({
    modelValue: '#445566',
    paletteAppend: {
      mode: 'draft' as const,
      worldColorPalette: '#112233'
    }
  })
  const useShortCap = createUseFaColorPickerPaletteAppend({
    ...paletteAppendFactoryDeps,
    paletteMaxLength: 12
  })
  const api = useShortCap(props, () => undefined, () => props.modelValue)
  expect(api.isPaletteAppendDisabled.value).toBe(true)
})

/**
 * createUseFaColorPickerPaletteAppend
 * No-ops when append is disabled or persist fails.
 */
test('Test that createUseFaColorPickerPaletteAppend no-ops on blocked clicks', async () => {
  const emitted: string[] = []
  const props = reactive({
    modelValue: '#112233',
    paletteAppend: {
      mode: 'draft' as const,
      worldColorPalette: '#112233'
    }
  })
  const api = usePaletteAppend(
    props,
    (colorPallete) => {
      emitted.push(colorPallete)
    },
    () => props.modelValue
  )

  await api.onPaletteAppendClick()
  expect(emitted).toHaveLength(0)

  const persistWorldColorPalette = vi.fn(async () => false)
  const useFailedPersist = createUseFaColorPickerPaletteAppend({
    ...paletteAppendFactoryDeps,
    persistWorldColorPalette
  })
  const persistProps = reactive({
    modelValue: '#aabbcc',
    paletteAppend: {
      mode: 'persist' as const,
      worldColorPalette: '#112233',
      worldId: 'world-1'
    }
  })
  const persistApi = useFailedPersist(
    persistProps,
    (colorPallete) => {
      emitted.push(colorPallete)
    },
    () => persistProps.modelValue
  )
  await persistApi.onPaletteAppendClick()
  expect(emitted).toHaveLength(0)
})

/**
 * createUseFaColorPickerPaletteAppend
 * Uses the default refresh callback when persist mode omits a per-input refresh hook.
 */
test('Test that createUseFaColorPickerPaletteAppend uses default refresh callback', async () => {
  const refreshProjectWorldColorPalette = vi.fn(async () => undefined)
  const useDefaultRefresh = createUseFaColorPickerPaletteAppend({
    ...paletteAppendFactoryDeps,
    refreshProjectWorldColorPalette
  })
  const props = reactive({
    modelValue: '#aabbcc',
    paletteAppend: {
      mode: 'persist' as const,
      worldColorPalette: '#112233',
      worldId: 'world-1'
    }
  })
  const api = useDefaultRefresh(
    props,
    () => undefined,
    () => props.modelValue
  )
  await api.onPaletteAppendClick()
  expect(refreshProjectWorldColorPalette).toHaveBeenCalled()
})

/**
 * createUseFaColorPickerPaletteAppend
 * Ignores clicks when append returns null after the disabled check passed.
 */
test('Test that createUseFaColorPickerPaletteAppend ignores null append results on click', async () => {
  let appendCalls = 0
  const appendWithSecondNull = createUseFaColorPickerPaletteAppend({
    ...paletteAppendFactoryDeps,
    appendFaProjectWorldColorPalleteHex: () => {
      appendCalls++
      if (appendCalls === 1) {
        return '#112233;#AABBCC'
      }
      return null
    }
  })
  const emitted: string[] = []
  const props = reactive({
    modelValue: '#aabbcc',
    paletteAppend: {
      mode: 'draft' as const,
      worldColorPalette: '#112233'
    }
  })
  const api = appendWithSecondNull(
    props,
    (colorPallete) => {
      emitted.push(colorPallete)
    },
    () => props.modelValue
  )

  expect(api.isPaletteAppendDisabled.value).toBe(false)
  await api.onPaletteAppendClick()
  expect(emitted).toHaveLength(0)
})
