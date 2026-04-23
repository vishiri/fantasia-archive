import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { faProgramConfigImportStagedSessions } from 'app/src-electron/mainScripts/programConfig/faProgramConfigImportStagedState'
import { tryStageImportFromUnzippedEntries } from 'app/src-electron/mainScripts/programConfig/faProgramConfigStageImportFromEntries'

/** Caught as non-Error in try/catch to cover the validation path. */
class SyntheticJsonParseMockFailure {}

beforeEach(() => {
  faProgramConfigImportStagedSessions.clear()
})

afterEach(() => {
  faProgramConfigImportStagedSessions.clear()
})

test('Test that tryStageImportFromUnzippedEntries returns error when no allowlisted content', () => {
  const r = tryStageImportFromUnzippedEntries({})
  expect(r.outcome).toBe('error')
})

test('Test that tryStageImportFromUnzippedEntries stages valid user settings', () => {
  const r = tryStageImportFromUnzippedEntries({
    userSettings: JSON.stringify(FA_USER_SETTINGS_DEFAULTS)
  })
  if (r.outcome !== 'ready' || r.sessionId === undefined) {
    throw new Error('expected ready')
  }
  const { sessionId } = r
  expect(sessionId).toBeTypeOf('string')
  expect(r.parts?.programSettings).toBe('ok')
  expect(faProgramConfigImportStagedSessions.get(sessionId)!.data.programSettings).toBeDefined()
})

test('Test that tryStageImportFromUnzippedEntries returns validation error on bad JSON', () => {
  const r = tryStageImportFromUnzippedEntries({
    userSettings: '{ not json'
  })
  expect(r.outcome).toBe('error')
})

test('Test that tryStageImportFromUnzippedEntries returns validation error when keybinds JSON is valid but does not match schema', () => {
  const r = tryStageImportFromUnzippedEntries({
    keybinds: JSON.stringify({ overrides: {} })
  })
  expect(r.outcome).toBe('error')
})

test('Test that tryStageImportFromUnzippedEntries returns validation error when program styling is invalid', () => {
  const r = tryStageImportFromUnzippedEntries({
    programStyling: JSON.stringify({
      css: 'x',
      schemaVersion: 1.5
    })
  })
  expect(r.outcome).toBe('error')
})

test('Test that tryStageImportFromUnzippedEntries stages keybinds and program styling when present and valid', () => {
  const r = tryStageImportFromUnzippedEntries({
    keybinds: JSON.stringify({
      overrides: { x: null },
      schemaVersion: 1
    }),
    programStyling: JSON.stringify({
      css: '',
      schemaVersion: 1
    })
  })
  if (r.outcome !== 'ready') {
    throw new Error('expected ready')
  }
  expect(r.parts?.keybinds).toBe('ok')
  expect(r.parts?.programStyling).toBe('ok')
})

test('Test that tryStageImportFromUnzippedEntries maps non-Error throws in JSON parsing to a validation error', () => {
  const j = vi.spyOn(JSON, 'parse')
  j.mockImplementationOnce((): never => {
    throw new SyntheticJsonParseMockFailure()
  })
  const r = tryStageImportFromUnzippedEntries({
    userSettings: 'true'
  })
  j.mockRestore()
  expect(r.outcome).toBe('error')
  if (r.outcome === 'error') {
    expect(r.errorName).toBe('ValidationError')
  }
})
