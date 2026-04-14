import { beforeEach, expect, test, vi } from 'vitest'

import { FA_KEYBINDS_IPC } from 'app/src-electron/electron-ipc-bridge'
import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'

const {
  cleanupFaKeybindsMock,
  getFaKeybindsMock,
  ipcMainHandleMock
} = vi.hoisted(() => {
  return {
    cleanupFaKeybindsMock: vi.fn(),
    getFaKeybindsMock: vi.fn(),
    ipcMainHandleMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    ipcMain: {
      handle: ipcMainHandleMock
    }
  }
})

vi.mock('app/src-electron/mainScripts/keybinds/faKeybindsStore', () => {
  return {
    cleanupFaKeybinds: cleanupFaKeybindsMock,
    getFaKeybinds: getFaKeybindsMock
  }
})

beforeEach(async () => {
  vi.resetModules()
  ipcMainHandleMock.mockReset()
  getFaKeybindsMock.mockReset()
  cleanupFaKeybindsMock.mockReset()
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call![1] as (...args: unknown[]) => unknown
}

/**
 * registerFaKeybindsIpc
 * Get handler returns platform and a shallow clone of overrides.
 */
test('Test that keybinds get handler returns platform and cloned store snapshot', async () => {
  const storeSnap = {
    overrides: { openProgramSettings: null },
    schemaVersion: 1 as const
  }
  const setMock = vi.fn()
  getFaKeybindsMock.mockReturnValue({
    set: setMock,
    store: storeSnap
  })

  const { registerFaKeybindsIpc } = await import('../registerFaKeybindsIpc')
  registerFaKeybindsIpc()

  const getHandler = handlerFor(FA_KEYBINDS_IPC.getAsync)
  const out = getHandler() as {
    platform: NodeJS.Platform
    store: typeof storeSnap
  }

  expect(out.platform).toBe(process.platform)
  expect(out.store).toEqual(storeSnap)
  expect(out.store.overrides).not.toBe(storeSnap.overrides)
})

/**
 * registerFaKeybindsIpc
 * Set handler honors replaceAllOverrides with a full overrides map.
 */
test('Test that keybinds set handler replaces overrides when replaceAllOverrides is true', async () => {
  const storeSnap = {
    overrides: { openProgramSettings: null },
    schemaVersion: 1 as const
  }
  const setMock = vi.fn()
  getFaKeybindsMock.mockReturnValue({
    set: setMock,
    store: storeSnap
  })

  const { registerFaKeybindsIpc } = await import('../registerFaKeybindsIpc')
  registerFaKeybindsIpc()

  const setHandler = handlerFor(FA_KEYBINDS_IPC.setAsync)
  setHandler(
    null,
    {
      overrides: {
        toggleDeveloperTools: {
          code: 'KeyI',
          mods: [
            'alt',
            'ctrl',
            'shift'
          ]
        }
      },
      replaceAllOverrides: true
    }
  )

  expect(setMock).toHaveBeenCalledWith({
    overrides: {
      toggleDeveloperTools: {
        code: 'KeyI',
        mods: [
          'alt',
          'ctrl',
          'shift'
        ]
      }
    },
    schemaVersion: 1
  })
  expect(cleanupFaKeybindsMock).toHaveBeenCalled()
})

/**
 * registerFaKeybindsIpc
 * Set handler merges partial overrides when replaceAllOverrides is false.
 */
test('Test that keybinds set handler merges overrides by default', async () => {
  const storeSnap = {
    overrides: {},
    schemaVersion: 1 as const
  }
  const setMock = vi.fn()
  getFaKeybindsMock.mockReturnValue({
    set: setMock,
    store: storeSnap
  })

  const { registerFaKeybindsIpc } = await import('../registerFaKeybindsIpc')
  registerFaKeybindsIpc()

  const setHandler = handlerFor(FA_KEYBINDS_IPC.setAsync)
  setHandler(
    null,
    {
      overrides: {
        openProgramSettings: {
          code: 'Comma',
          mods: ['meta']
        }
      }
    }
  )

  expect(setMock).toHaveBeenCalledWith({
    overrides: {
      openProgramSettings: {
        code: 'Comma',
        mods: ['meta']
      }
    },
    schemaVersion: 1
  })
})

/**
 * registerFaKeybindsIpc
 * Second registration does not register duplicate ipcMain handlers.
 */
test('Test that keybinds set handler merges when patch omits overrides', async () => {
  const storeSnap = {
    overrides: {
      openProgramSettings: null
    },
    schemaVersion: 1 as const
  }
  const setMock = vi.fn()
  getFaKeybindsMock.mockReturnValue({
    set: setMock,
    store: storeSnap
  })

  const { registerFaKeybindsIpc } = await import('../registerFaKeybindsIpc')
  registerFaKeybindsIpc()

  const setHandler = handlerFor(FA_KEYBINDS_IPC.setAsync)
  setHandler(null, {})

  expect(setMock).toHaveBeenCalledWith({
    overrides: {
      openProgramSettings: null
    },
    schemaVersion: 1
  })
})

/**
 * registerFaKeybindsIpc
 * Second registration does not register duplicate ipcMain handlers.
 */
test('Test that registerFaKeybindsIpc only registers ipc handlers once', async () => {
  getFaKeybindsMock.mockReturnValue({
    set: vi.fn(),
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  })

  const { registerFaKeybindsIpc } = await import('../registerFaKeybindsIpc')
  registerFaKeybindsIpc()
  registerFaKeybindsIpc()

  expect(ipcMainHandleMock).toHaveBeenCalledTimes(2)
})
