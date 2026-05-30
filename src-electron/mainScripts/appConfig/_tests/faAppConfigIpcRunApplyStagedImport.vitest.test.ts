import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appNoteboard/appNoteboard_managerDefaults'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { faAppConfigImportStagedSessions } from 'app/src-electron/mainScripts/appConfig/faAppConfigImportStagedState'
import { runApplyStagedAppConfigImport } from '../faAppConfigIpcRunApplyStagedImport'

const {
  applySpellMock,
  getFaKeybindsMock,
  getFaAppNoteboardMock,
  getFaAppStylingMock,
  getFaUserSettingsMock
} = vi.hoisted(() => ({
  applySpellMock: vi.fn(),
  getFaKeybindsMock: vi.fn(),
  getFaAppNoteboardMock: vi.fn(),
  getFaAppStylingMock: vi.fn(),
  getFaUserSettingsMock: vi.fn()
}))

vi.mock('app/src-electron/mainScripts/userSettings/userSettings_manager', () => ({
  cleanupFaUserSettings: vi.fn(),
  getFaUserSettings: getFaUserSettingsMock
}))

vi.mock('app/src-electron/mainScripts/keybinds/keybinds_manager', () => ({
  cleanupFaKeybinds: vi.fn(),
  getFaKeybinds: getFaKeybindsMock
}))

vi.mock('app/src-electron/mainScripts/appNoteboard/appNoteboard_manager', () => ({
  cleanupFaAppNoteboard: vi.fn(),
  getFaAppNoteboard: getFaAppNoteboardMock
}))

vi.mock('app/src-electron/mainScripts/appStyling/appStyling_manager', () => ({
  cleanupFaAppStyling: vi.fn(),
  getFaAppStyling: getFaAppStylingMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/faSpellCheckerSession', () => ({
  applyFaSpellCheckerLanguagesToSession: applySpellMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/mainWindowCreation', () => ({
  appWindow: { webContents: { session: {} } }
}))

beforeEach(() => {
  faAppConfigImportStagedSessions.clear()
  applySpellMock.mockReset()
  getFaUserSettingsMock.mockReturnValue({ store: {} })
  getFaKeybindsMock.mockReturnValue({ store: {} })
  getFaAppNoteboardMock.mockReturnValue({ store: {} })
  getFaAppStylingMock.mockReturnValue({ store: {} })
})

afterEach(() => {
  faAppConfigImportStagedSessions.clear()
})

test('Test runApplyStagedAppConfigImport throws when no part selected', () => {
  expect(() =>
    runApplyStagedAppConfigImport({
      applyKeybinds: false,
      applyAppNoteboard: false,
      applyAppSettings: false,
      applyAppStyling: false,
      sessionId: 'x'
    })
  ).toThrow(RangeError)
})

test('Test runApplyStagedAppConfigImport throws when session missing', () => {
  expect(() =>
    runApplyStagedAppConfigImport({
      applyKeybinds: true,
      applyAppNoteboard: false,
      applyAppSettings: false,
      applyAppStyling: false,
      sessionId: 'nope'
    })
  ).toThrow(/expired/i)
})

test('Test runApplyStagedAppConfigImport applies app settings and clears session', () => {
  const sid = 's1'
  faAppConfigImportStagedSessions.set(sid, {
    data: { appSettings: { ...FA_USER_SETTINGS_DEFAULTS } },
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'ok',
      appNoteboard: 'absent',
      appSettings: 'ok',
      appStyling: 'absent'
    }
  })
  const r = runApplyStagedAppConfigImport({
    applyKeybinds: false,
    applyAppNoteboard: false,
    applyAppSettings: true,
    applyAppStyling: false,
    sessionId: sid
  })
  expect(r.appliedParts).toEqual(['appSettings'])
  expect(faAppConfigImportStagedSessions.has(sid)).toBe(false)
  expect(applySpellMock).toHaveBeenCalled()
})

test('Test runApplyStagedAppConfigImport applies only keybinds from staged data', () => {
  const sid = 'kb'
  faAppConfigImportStagedSessions.set(sid, {
    data: {
      keybinds: {
        overrides: {},
        schemaVersion: 1
      }
    },
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'ok',
      appNoteboard: 'absent',
      appSettings: 'absent',
      appStyling: 'absent'
    }
  })
  const r = runApplyStagedAppConfigImport({
    applyKeybinds: true,
    applyAppNoteboard: false,
    applyAppSettings: false,
    applyAppStyling: false,
    sessionId: sid
  })
  expect(r.appliedParts).toEqual(['keybinds'])
  expect(faAppConfigImportStagedSessions.has(sid)).toBe(false)
  expect(applySpellMock).not.toHaveBeenCalled()
})

test('Test runApplyStagedAppConfigImport applies only app noteboard from staged data', () => {
  const sid = 'nb'
  faAppConfigImportStagedSessions.set(sid, {
    data: {
      appNoteboard: {
        ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
        text: 'hello'
      }
    },
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'absent',
      appNoteboard: 'ok',
      appSettings: 'absent',
      appStyling: 'absent'
    }
  })
  const r = runApplyStagedAppConfigImport({
    applyKeybinds: false,
    applyAppNoteboard: true,
    applyAppSettings: false,
    applyAppStyling: false,
    sessionId: sid
  })
  expect(r.appliedParts).toEqual(['appNoteboard'])
  expect(faAppConfigImportStagedSessions.has(sid)).toBe(false)
})

test('Test runApplyStagedAppConfigImport applies only app styling from staged data', () => {
  const sid = 'st'
  faAppConfigImportStagedSessions.set(sid, {
    data: {
      appStyling: {
        css: '',
        frame: null,
        schemaVersion: 1
      }
    },
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'absent',
      appNoteboard: 'absent',
      appSettings: 'absent',
      appStyling: 'ok'
    }
  })
  const r = runApplyStagedAppConfigImport({
    applyKeybinds: false,
    applyAppNoteboard: false,
    applyAppSettings: false,
    applyAppStyling: true,
    sessionId: sid
  })
  expect(r.appliedParts).toEqual(['appStyling'])
  expect(faAppConfigImportStagedSessions.has(sid)).toBe(false)
})

test('Test runApplyStagedAppConfigImport throws when selected parts are absent from the session', () => {
  const sid = 'mismatch'
  faAppConfigImportStagedSessions.set(sid, {
    data: {
      keybinds: {
        overrides: {},
        schemaVersion: 1
      }
    },
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'ok',
      appNoteboard: 'absent',
      appSettings: 'absent',
      appStyling: 'absent'
    }
  })
  expect(() =>
    runApplyStagedAppConfigImport({
      applyKeybinds: false,
      applyAppNoteboard: false,
      applyAppSettings: true,
      applyAppStyling: false,
      sessionId: sid
    })
  ).toThrow(/no matching content/i)
})
