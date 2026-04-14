import { vi, expect, test, beforeEach } from 'vitest'
import { ZodError } from 'zod'

import { FA_USER_SETTINGS_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { FA_USER_SETTINGS_DEFAULTS } from '../../userSettings/faUserSettingsDefaults'

const {
  applyFaSpellCheckerLanguagesToSessionMock,
  ipcMainHandleMock,
  getFaUserSettingsMock,
  ipcSpellSessionStub,
  storeSetMock
} = vi.hoisted(() => {
  const spellSessionStub = {}
  return {
    applyFaSpellCheckerLanguagesToSessionMock: vi.fn(),
    ipcMainHandleMock: vi.fn(),
    getFaUserSettingsMock: vi.fn(),
    ipcSpellSessionStub: spellSessionStub,
    storeSetMock: vi.fn()
  }
})

const mainWindowExportState = vi.hoisted(() => {
  return {
    appWindow: undefined as
    | {
      webContents: {
        session: object
      }
    }
    | undefined
  }
})

vi.mock('electron', () => {
  return {
    ipcMain: {
      handle: ipcMainHandleMock
    }
  }
})

vi.mock('app/src-electron/mainScripts/userSettings/userSettingsStore', () => {
  return {
    getFaUserSettings: getFaUserSettingsMock
  }
})

vi.mock('app/src-electron/mainScripts/windowManagement/mainWindowCreation', () => {
  return {
    get appWindow () {
      return mainWindowExportState.appWindow
    }
  }
})

vi.mock('app/src-electron/mainScripts/windowManagement/faSpellCheckerSession', () => {
  return {
    applyFaSpellCheckerLanguagesToSession: applyFaSpellCheckerLanguagesToSessionMock
  }
})

beforeEach(async () => {
  vi.resetModules()
  ipcMainHandleMock.mockReset()
  storeSetMock.mockReset()
  getFaUserSettingsMock.mockReset()
  applyFaSpellCheckerLanguagesToSessionMock.mockReset()
  mainWindowExportState.appWindow = undefined
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call?.[1] as (...args: unknown[]) => unknown
}

/**
 * registerFaUserSettingsIpc
 * Get handler returns a shallow snapshot of the full 'electron-store' object, not a manual key list.
 */
test('Test that user settings get handler returns all keys from the backing store', async () => {
  const store = {
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: true,
    futureKey: true
  } as I_faUserSettings & Record<string, unknown>
  getFaUserSettingsMock.mockReturnValue({
    store,
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()

  const getHandler = handlerFor(FA_USER_SETTINGS_IPC.getAsync)
  const snapshot = getHandler() as typeof store

  expect(snapshot).toEqual(store)
  expect(snapshot).not.toBe(store)
})

/**
 * registerFaUserSettingsIpc
 * Set handler merges the patch onto the current full snapshot before persisting.
 */
test('Test that user settings set handler writes merged store state', async () => {
  getFaUserSettingsMock.mockReturnValue({
    store: {
      ...FA_USER_SETTINGS_DEFAULTS,
      darkMode: true
    },
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()

  const setHandler = handlerFor(FA_USER_SETTINGS_IPC.setAsync)
  setHandler({}, { darkMode: false })

  expect(storeSetMock).toHaveBeenCalledOnce()
  expect(storeSetMock).toHaveBeenCalledWith({
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: false
  })
})

/**
 * registerFaUserSettingsIpc
 * Set handler does not persist when patch fails Zod validation.
 */
test('Test that user settings set handler throws ZodError and skips store set for invalid patch', async () => {
  getFaUserSettingsMock.mockReturnValue({
    store: { ...FA_USER_SETTINGS_DEFAULTS },
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()

  const setHandler = handlerFor(FA_USER_SETTINGS_IPC.setAsync)
  expect(() => {
    setHandler({}, { darkMode: 'false' })
  }).toThrow(ZodError)
  expect(storeSetMock).not.toHaveBeenCalled()
})

/**
 * registerFaUserSettingsIpc
 * Set handler does not persist when patch root is not a plain object.
 */
test('Test that user settings set handler throws TypeError and skips store set for non-object patch', async () => {
  getFaUserSettingsMock.mockReturnValue({
    store: { ...FA_USER_SETTINGS_DEFAULTS },
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()

  const setHandler = handlerFor(FA_USER_SETTINGS_IPC.setAsync)
  expect(() => {
    setHandler({}, null)
  }).toThrow(TypeError)
  expect(storeSetMock).not.toHaveBeenCalled()
})

/**
 * registerFaUserSettingsIpc
 * Second registration does not register duplicate IPC handlers.
 */
test('Test that registerFaUserSettingsIpc only wires handlers once', async () => {
  getFaUserSettingsMock.mockReturnValue({
    store: { ...FA_USER_SETTINGS_DEFAULTS },
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()
  expect(ipcMainHandleMock).toHaveBeenCalledTimes(2)

  registerFaUserSettingsIpc()
  expect(ipcMainHandleMock).toHaveBeenCalledTimes(2)
})

/**
 * registerFaUserSettingsIpc
 * Set handler refreshes spellchecker session languages when languageCode is patched and the main window exists.
 */
test('Test that user settings set handler syncs spellchecker when languageCode changes', async () => {
  mainWindowExportState.appWindow = {
    webContents: {
      session: ipcSpellSessionStub
    }
  }
  getFaUserSettingsMock.mockReturnValue({
    store: {
      ...FA_USER_SETTINGS_DEFAULTS,
      languageCode: 'en-US'
    },
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()

  const setHandler = handlerFor(FA_USER_SETTINGS_IPC.setAsync)
  setHandler({}, { languageCode: 'fr' })

  expect(applyFaSpellCheckerLanguagesToSessionMock).toHaveBeenCalledWith(ipcSpellSessionStub, 'fr')
})

/**
 * registerFaUserSettingsIpc
 * Set handler still syncs spellchecker when saving en-US again.
 */
test('Test that user settings set handler syncs spellchecker when saving en-US again', async () => {
  mainWindowExportState.appWindow = {
    webContents: {
      session: ipcSpellSessionStub
    }
  }
  getFaUserSettingsMock.mockReturnValue({
    store: {
      ...FA_USER_SETTINGS_DEFAULTS,
      languageCode: 'en-US'
    },
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()

  const setHandler = handlerFor(FA_USER_SETTINGS_IPC.setAsync)
  setHandler({}, { languageCode: 'en-US' })

  expect(applyFaSpellCheckerLanguagesToSessionMock).toHaveBeenCalledWith(ipcSpellSessionStub, 'en-US')
})

/**
 * registerFaUserSettingsIpc
 * Set handler skips spellchecker sync when the patch omits languageCode.
 */
test('Test that user settings set handler does not sync spellchecker when languageCode is unchanged', async () => {
  mainWindowExportState.appWindow = {
    webContents: {
      session: ipcSpellSessionStub
    }
  }
  getFaUserSettingsMock.mockReturnValue({
    store: { ...FA_USER_SETTINGS_DEFAULTS },
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()

  const setHandler = handlerFor(FA_USER_SETTINGS_IPC.setAsync)
  setHandler({}, { darkMode: false })

  expect(applyFaSpellCheckerLanguagesToSessionMock).not.toHaveBeenCalled()
})

/**
 * registerFaUserSettingsIpc
 * Set handler syncs spellchecker when switching between fr and de.
 */
test('Test that user settings set handler syncs spellchecker when leaving fr for de', async () => {
  mainWindowExportState.appWindow = {
    webContents: {
      session: ipcSpellSessionStub
    }
  }
  getFaUserSettingsMock.mockReturnValue({
    store: {
      ...FA_USER_SETTINGS_DEFAULTS,
      languageCode: 'fr'
    },
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()

  const setHandler = handlerFor(FA_USER_SETTINGS_IPC.setAsync)
  setHandler({}, { languageCode: 'de' })

  expect(applyFaSpellCheckerLanguagesToSessionMock).toHaveBeenCalledWith(ipcSpellSessionStub, 'de')
})

/**
 * registerFaUserSettingsIpc
 * Set handler skips spellchecker sync when the main window is not created yet.
 */
test('Test that user settings set handler skips spellchecker sync when appWindow is undefined', async () => {
  mainWindowExportState.appWindow = undefined
  getFaUserSettingsMock.mockReturnValue({
    store: { ...FA_USER_SETTINGS_DEFAULTS },
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()

  const setHandler = handlerFor(FA_USER_SETTINGS_IPC.setAsync)
  setHandler({}, { languageCode: 'de' })

  expect(applyFaSpellCheckerLanguagesToSessionMock).not.toHaveBeenCalled()
})
