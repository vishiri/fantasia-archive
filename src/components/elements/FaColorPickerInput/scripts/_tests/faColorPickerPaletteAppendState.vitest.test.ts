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

const draftConfig = {
  mode: 'draft' as const,
  worldColorPalette: '#112233'
}

const persistConfig = {
  mode: 'persist' as const,
  worldColorPalette: '#112233',
  worldId: 'world-1'
}

/**
 * faColorPickerPaletteAppendState
 * Reports duplicate append candidates only for valid hex values already in the palette.
 */
test('Test that isFaColorPickerPaletteAppendDuplicate detects palette duplicates', () => {
  expect(isFaColorPickerPaletteAppendDuplicate(
    undefined,
    '#112233',
    faProjectWorldColorPalleteContainsHex,
    isFaProjectWorldStorageHexColor
  )).toBe(false)

  expect(isFaColorPickerPaletteAppendDuplicate(
    draftConfig,
    '#112233',
    faProjectWorldColorPalleteContainsHex,
    isFaProjectWorldStorageHexColor
  )).toBe(true)

  expect(isFaColorPickerPaletteAppendDuplicate(
    draftConfig,
    'not-a-color',
    faProjectWorldColorPalleteContainsHex,
    isFaProjectWorldStorageHexColor
  )).toBe(false)
})

/**
 * faColorPickerPaletteAppendState
 * Disables append for missing config, invalid hex, duplicates, caps, and missing world id.
 */
test('Test that isFaColorPickerPaletteAppendDisabled blocks invalid append states', () => {
  expect(isFaColorPickerPaletteAppendDisabled(
    undefined,
    '#112233',
    appendFaProjectWorldColorPalleteHex,
    faProjectWorldColorPalleteContainsHex,
    isFaProjectWorldStorageHexColor,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    readFaColorPickerPaletteAppendWorldId
  )).toBe(true)

  expect(isFaColorPickerPaletteAppendDisabled(
    draftConfig,
    '#aabbcc',
    appendFaProjectWorldColorPalleteHex,
    faProjectWorldColorPalleteContainsHex,
    isFaProjectWorldStorageHexColor,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    readFaColorPickerPaletteAppendWorldId
  )).toBe(false)

  expect(isFaColorPickerPaletteAppendDisabled(
    {
      mode: 'persist',
      worldColorPalette: '#112233'
    },
    '#aabbcc',
    appendFaProjectWorldColorPalleteHex,
    faProjectWorldColorPalleteContainsHex,
    isFaProjectWorldStorageHexColor,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    readFaColorPickerPaletteAppendWorldId
  )).toBe(true)
})

/**
 * faColorPickerPaletteAppendState
 * Emits draft palette updates without persisting.
 */
test('Test that runFaColorPickerPaletteAppendClick emits draft palette updates', async () => {
  const emitted: string[] = []
  await runFaColorPickerPaletteAppendClick(
    draftConfig,
    '#aabbcc',
    appendFaProjectWorldColorPalleteHex,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    vi.fn(async () => true),
    readFaColorPickerPaletteAppendWorldId,
    vi.fn(async () => undefined),
    (colorPallete) => {
      emitted.push(colorPallete)
    }
  )
  expect(emitted).toEqual(['#112233;#AABBCC'])
})

/**
 * faColorPickerPaletteAppendState
 * Persists palette updates and refreshes project palette state in persist mode.
 */
test('Test that runFaColorPickerPaletteAppendClick persists palette updates', async () => {
  const persistWorldColorPalette = vi.fn(async () => true)
  const refreshProjectWorldColorPalette = vi.fn(async () => undefined)
  const emitted: string[] = []

  await runFaColorPickerPaletteAppendClick(
    persistConfig,
    '#aabbcc',
    appendFaProjectWorldColorPalleteHex,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    persistWorldColorPalette,
    readFaColorPickerPaletteAppendWorldId,
    refreshProjectWorldColorPalette,
    (colorPallete) => {
      emitted.push(colorPallete)
    }
  )

  expect(persistWorldColorPalette).toHaveBeenCalledWith('world-1', '#112233;#AABBCC')
  expect(refreshProjectWorldColorPalette).toHaveBeenCalled()
  expect(emitted).toEqual(['#112233;#AABBCC'])
})

/**
 * faColorPickerPaletteAppendState
 * No-ops when persist fails or append returns null.
 */
test('Test that runFaColorPickerPaletteAppendClick no-ops on persist failure', async () => {
  const emitted: string[] = []
  await runFaColorPickerPaletteAppendClick(
    persistConfig,
    '#aabbcc',
    appendFaProjectWorldColorPalleteHex,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    vi.fn(async () => false),
    readFaColorPickerPaletteAppendWorldId,
    vi.fn(async () => undefined),
    (colorPallete) => {
      emitted.push(colorPallete)
    }
  )
  expect(emitted).toHaveLength(0)

  await runFaColorPickerPaletteAppendClick(
    draftConfig,
    '#aabbcc',
    () => null,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    vi.fn(async () => true),
    readFaColorPickerPaletteAppendWorldId,
    vi.fn(async () => undefined),
    (colorPallete) => {
      emitted.push(colorPallete)
    }
  )
  expect(emitted).toHaveLength(0)
})
