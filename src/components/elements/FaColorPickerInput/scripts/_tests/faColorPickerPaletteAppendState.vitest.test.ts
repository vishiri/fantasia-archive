import { expect, test, vi } from 'vitest'

import { FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH } from 'app/types/I_faProjectWorldDomain'
import {
  appendFaProjectWorldColorPaletteHex,
  faProjectWorldColorPaletteContainsHex,
  isFaProjectWorldStorageHexColor
} from 'app/src/scripts/projectWorlds/functions/faProjectWorldColorPaletteHexList'

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
    faProjectWorldColorPaletteContainsHex,
    isFaProjectWorldStorageHexColor
  )).toBe(false)

  expect(isFaColorPickerPaletteAppendDuplicate(
    draftConfig,
    '#112233',
    faProjectWorldColorPaletteContainsHex,
    isFaProjectWorldStorageHexColor
  )).toBe(true)

  expect(isFaColorPickerPaletteAppendDuplicate(
    draftConfig,
    'not-a-color',
    faProjectWorldColorPaletteContainsHex,
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
    appendFaProjectWorldColorPaletteHex,
    faProjectWorldColorPaletteContainsHex,
    isFaProjectWorldStorageHexColor,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    readFaColorPickerPaletteAppendWorldId
  )).toBe(true)

  expect(isFaColorPickerPaletteAppendDisabled(
    draftConfig,
    '#aabbcc',
    appendFaProjectWorldColorPaletteHex,
    faProjectWorldColorPaletteContainsHex,
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
    appendFaProjectWorldColorPaletteHex,
    faProjectWorldColorPaletteContainsHex,
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
  const emitted: Array<{ colorPalette: string, worldId: string }> = []
  await runFaColorPickerPaletteAppendClick(
    draftConfig,
    '#aabbcc',
    appendFaProjectWorldColorPaletteHex,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    vi.fn(async () => true),
    readFaColorPickerPaletteAppendWorldId,
    vi.fn(async () => undefined),
    (colorPalette, worldId) => {
      emitted.push({
        colorPalette,
        worldId
      })
    }
  )
  expect(emitted).toEqual([{
    colorPalette: '#112233;#AABBCC',
    worldId: ''
  }])
})

/**
 * faColorPickerPaletteAppendState
 * Persists palette updates and refreshes project palette state in persist mode.
 */
test('Test that runFaColorPickerPaletteAppendClick persists palette updates', async () => {
  const persistWorldColorPalette = vi.fn(async () => true)
  const refreshProjectWorldColorPalette = vi.fn(async () => undefined)
  const emitted: Array<{ colorPalette: string, worldId: string }> = []

  await runFaColorPickerPaletteAppendClick(
    persistConfig,
    '#aabbcc',
    appendFaProjectWorldColorPaletteHex,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    persistWorldColorPalette,
    readFaColorPickerPaletteAppendWorldId,
    refreshProjectWorldColorPalette,
    (colorPalette, worldId) => {
      emitted.push({
        colorPalette,
        worldId
      })
    }
  )

  expect(persistWorldColorPalette).toHaveBeenCalledWith('world-1', '#112233;#AABBCC')
  expect(refreshProjectWorldColorPalette).toHaveBeenCalled()
  expect(emitted).toEqual([{
    colorPalette: '#112233;#AABBCC',
    worldId: 'world-1'
  }])
})

/**
 * faColorPickerPaletteAppendState
 * The emitted world id is the one read before the palette save, not a later edit of the config.
 */
test('Test that runFaColorPickerPaletteAppendClick keeps the world id from the click', async () => {
  let releasePersist: () => void = () => {}
  const persistGate = new Promise<void>((resolve) => {
    releasePersist = resolve
  })
  const config = {
    mode: 'persist' as const,
    worldColorPalette: '#112233',
    worldId: 'world-saved'
  }
  const emittedWorldIds: string[] = []
  const pending = runFaColorPickerPaletteAppendClick(
    config,
    '#aabbcc',
    appendFaProjectWorldColorPaletteHex,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    async () => {
      config.worldId = 'world-live'
      await persistGate
      return true
    },
    readFaColorPickerPaletteAppendWorldId,
    vi.fn(async () => undefined),
    (_colorPalette, worldId) => {
      emittedWorldIds.push(worldId)
    }
  )
  releasePersist()
  await pending
  expect(emittedWorldIds).toEqual(['world-saved'])
})

/**
 * faColorPickerPaletteAppendState
 * No-ops when persist fails or append returns null.
 */
test('Test that runFaColorPickerPaletteAppendClick no-ops on persist failure', async () => {
  const emitted: Array<{ colorPalette: string, worldId: string }> = []
  await runFaColorPickerPaletteAppendClick(
    persistConfig,
    '#aabbcc',
    appendFaProjectWorldColorPaletteHex,
    FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    vi.fn(async () => false),
    readFaColorPickerPaletteAppendWorldId,
    vi.fn(async () => undefined),
    (colorPalette, worldId) => {
      emitted.push({
        colorPalette,
        worldId
      })
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
    (colorPalette, worldId) => {
      emitted.push({
        colorPalette,
        worldId
      })
    }
  )
  expect(emitted).toHaveLength(0)
})
