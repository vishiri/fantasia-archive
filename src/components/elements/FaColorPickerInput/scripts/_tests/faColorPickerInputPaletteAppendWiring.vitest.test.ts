import { createPinia, setActivePinia } from 'pinia'
import { afterEach, expect, test, vi } from 'vitest'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

import { faColorPickerInputPaletteAppendWiring } from '../faColorPickerInputPaletteAppendWiring'

afterEach(() => {
  setActivePinia(undefined)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/**
 * faColorPickerInputPaletteAppendWiring
 * Persists palette updates through projectContent when the bridge is available.
 */
test('Test that faColorPickerInputPaletteAppendWiring persists without an active Pinia', async () => {
  setActivePinia(undefined)
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
    '#112233'
  )

  expect(persisted).toBe(true)
})

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
  expect(updateWorld).toHaveBeenCalledWith('world-1', { colorPalette: '#112233;#445566' })
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

test('Test that faColorPickerInputPaletteAppendWiring skips the write while a project open is in flight', async () => {
  setActivePinia(createPinia())
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-a',
    name: 'A'
  })
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockReturnValue(true)
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
    '#112233'
  )
  expect(persisted).toBe(false)
  expect(updateWorld).not.toHaveBeenCalled()
  setActivePinia(undefined)
})

test('Test that faColorPickerInputPaletteAppendWiring skips layout apply after the project changes', async () => {
  setActivePinia(createPinia())
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-a',
    name: 'A'
  })
  let resolveUpdate: ((value: { id: string }) => void) | undefined
  const updateWorld = vi.fn(() => {
    return new Promise<{ id: string }>((resolve) => {
      resolveUpdate = resolve
    })
  })
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        updateWorld
      }
    }
  })
  const pending = faColorPickerInputPaletteAppendWiring.persistWorldColorPalette(
    'world-1',
    '#112233'
  )
  await vi.waitUntil(() => updateWorld.mock.calls.length === 1)
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveUpdate?.({ id: 'world-1' })
  await expect(pending).resolves.toBe(false)
  setActivePinia(undefined)
})

test('Test that faColorPickerInputPaletteAppendWiring noop refresh resolves', async () => {
  await expect(
    faColorPickerInputPaletteAppendWiring.noopRefreshProjectColorPalette()
  ).resolves.toBeUndefined()
})
