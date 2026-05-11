import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appNoteboard/faAppNoteboardStoreDefaults'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { faAppConfigImportStagedSessions } from 'app/src-electron/mainScripts/appConfig/faAppConfigImportStagedState'
import { tryStageAppImportFromUnzippedEntries } from 'app/src-electron/mainScripts/appConfig/faAppConfigStageImportFromEntries'

/** Caught as non-Error in try/catch to cover the validation path. */
class SyntheticJsonParseMockFailure {}

beforeEach(() => {
  faAppConfigImportStagedSessions.clear()
})

afterEach(() => {
  faAppConfigImportStagedSessions.clear()
})

test('Test that tryStageAppImportFromUnzippedEntries returns error when no allowlisted content', () => {
  const r = tryStageAppImportFromUnzippedEntries({})
  expect(r.outcome).toBe('error')
})

test('Test that tryStageAppImportFromUnzippedEntries stages valid user settings', () => {
  const r = tryStageAppImportFromUnzippedEntries({
    userSettings: JSON.stringify(FA_USER_SETTINGS_DEFAULTS)
  })
  if (r.outcome !== 'ready' || r.sessionId === undefined) {
    throw new Error('expected ready')
  }
  const { sessionId } = r
  expect(sessionId).toBeTypeOf('string')
  expect(r.parts?.appSettings).toBe('ok')
  expect(faAppConfigImportStagedSessions.get(sessionId)!.data.appSettings).toBeDefined()
})

test('Test that tryStageAppImportFromUnzippedEntries returns validation error on bad JSON', () => {
  const r = tryStageAppImportFromUnzippedEntries({
    userSettings: '{ not json'
  })
  expect(r.outcome).toBe('error')
})

test('Test that tryStageAppImportFromUnzippedEntries returns validation error when keybinds JSON is valid but does not match schema', () => {
  const r = tryStageAppImportFromUnzippedEntries({
    keybinds: JSON.stringify({ overrides: {} })
  })
  expect(r.outcome).toBe('error')
})

test('Test that tryStageAppImportFromUnzippedEntries returns validation error when app styling is invalid', () => {
  const r = tryStageAppImportFromUnzippedEntries({
    appStyling: JSON.stringify({
      css: 'x',
      schemaVersion: 1.5
    })
  })
  expect(r.outcome).toBe('error')
})

test('Test that tryStageAppImportFromUnzippedEntries stages keybinds and app styling when present and valid', () => {
  const r = tryStageAppImportFromUnzippedEntries({
    keybinds: JSON.stringify({
      overrides: { x: null },
      schemaVersion: 1
    }),
    appStyling: JSON.stringify({
      css: '',
      schemaVersion: 1
    })
  })
  if (r.outcome !== 'ready') {
    throw new Error('expected ready')
  }
  expect(r.parts?.keybinds).toBe('ok')
  expect(r.parts?.appStyling).toBe('ok')
})

test('Test that tryStageAppImportFromUnzippedEntries stages app noteboard when present and valid', () => {
  const r = tryStageAppImportFromUnzippedEntries({
    appNoteboard: JSON.stringify({
      ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
      text: 'x'
    })
  })
  if (r.outcome !== 'ready' || r.sessionId === undefined) {
    throw new Error('expected ready')
  }
  expect(r.parts?.appNoteboard).toBe('ok')
  expect(faAppConfigImportStagedSessions.get(r.sessionId)!.data.appNoteboard?.text).toBe('x')
})

test('Test that tryStageAppImportFromUnzippedEntries maps non-Error throws in JSON parsing to a validation error', () => {
  const j = vi.spyOn(JSON, 'parse')
  j.mockImplementationOnce((): never => {
    throw new SyntheticJsonParseMockFailure()
  })
  const r = tryStageAppImportFromUnzippedEntries({
    userSettings: 'true'
  })
  j.mockRestore()
  expect(r.outcome).toBe('error')
  if (r.outcome === 'error') {
    expect(r.errorName).toBe('ValidationError')
  }
})
