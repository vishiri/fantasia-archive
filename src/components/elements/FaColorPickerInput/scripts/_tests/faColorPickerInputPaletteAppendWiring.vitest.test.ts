import { afterEach, expect, test, vi } from 'vitest'

import { faColorPickerInputPaletteAppendWiring } from '../faColorPickerInputPaletteAppendWiring'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/**
 * faColorPickerInputPaletteAppendWiring
 * Persists palette updates through projectContent when the bridge is available.
 */
test('Test that faColorPickerInputPaletteAppendWiring persists through projectContent', async () => {
  const updateWorld = vi.fn(async () => ({ id: 'world-1' }))
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        updateWorld
      }
    }
  })

  const persisted = await faColorPickerInputPaletteAppendWiring.persistWorldColorPalette(
    'world-1',
    '#112233;#445566'
  )

  expect(persisted).toBe(true)
  expect(updateWorld).toHaveBeenCalledWith('world-1', { colorPallete: '#112233;#445566' })
})

/**
 * faColorPickerInputPaletteAppendWiring
 * Returns false when projectContent updateWorld is unavailable or throws.
 */
test('Test that faColorPickerInputPaletteAppendWiring handles persist failures', async () => {
  vi.stubGlobal('window', {})

  const missingBridge = await faColorPickerInputPaletteAppendWiring.persistWorldColorPalette(
    'world-1',
    '#112233'
  )
  expect(missingBridge).toBe(false)

  const updateWorld = vi.fn(async () => {
    throw new Error('persist failed')
  })
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        updateWorld
      }
    }
  })

  const rejected = await faColorPickerInputPaletteAppendWiring.persistWorldColorPalette(
    'world-1',
    '#112233'
  )
  expect(rejected).toBe(false)
})

/**
 * faColorPickerInputPaletteAppendWiring
 * noopRefreshProjectColorPalette resolves without work.
 */
test('Test that faColorPickerInputPaletteAppendWiring noop refresh resolves', async () => {
  await expect(
    faColorPickerInputPaletteAppendWiring.noopRefreshProjectColorPalette()
  ).resolves.toBeUndefined()
})
