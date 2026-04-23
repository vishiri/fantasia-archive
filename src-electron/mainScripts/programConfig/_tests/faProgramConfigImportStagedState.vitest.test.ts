import { afterEach, beforeEach, expect, test } from 'vitest'

import { faProgramConfigImportStagedSessions, purgeFaProgramConfigStagedImportSessionsExpired, pathLooksLikeFaconfigFile } from '../faProgramConfigImportStagedState'

beforeEach(() => {
  faProgramConfigImportStagedSessions.clear()
})

afterEach(() => {
  faProgramConfigImportStagedSessions.clear()
})

test('Test that pathLooksLikeFaconfigFile is case-insensitive on extension', () => {
  expect(pathLooksLikeFaconfigFile('C:\\x.FACONFIG')).toBe(true)
  expect(pathLooksLikeFaconfigFile('a.json')).toBe(false)
  expect(pathLooksLikeFaconfigFile('C:\\a.faconfig.bak')).toBe(false)
  expect(pathLooksLikeFaconfigFile('.faconfig')).toBe(true)
  expect(pathLooksLikeFaconfigFile('')).toBe(false)
  expect(pathLooksLikeFaconfigFile('config.faconfig extra')).toBe(false)
})

test('Test that purgeFaProgramConfigStagedImportSessionsExpired removes old sessions', () => {
  faProgramConfigImportStagedSessions.set('old', {
    data: {},
    expiresAt: Date.now() - 1,
    parts: {
      keybinds: 'absent',
      programSettings: 'absent',
      programStyling: 'absent'
    }
  })
  faProgramConfigImportStagedSessions.set('new', {
    data: {},
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'absent',
      programSettings: 'absent',
      programStyling: 'absent'
    }
  })
  purgeFaProgramConfigStagedImportSessionsExpired()
  expect(faProgramConfigImportStagedSessions.has('old')).toBe(false)
  expect(faProgramConfigImportStagedSessions.has('new')).toBe(true)
})

test('Test that purgeFaProgramConfigStagedImportSessionsExpired is a no-op on an empty map', () => {
  faProgramConfigImportStagedSessions.clear()
  purgeFaProgramConfigStagedImportSessionsExpired()
  expect(faProgramConfigImportStagedSessions.size).toBe(0)
})

test('Test that purgeFaProgramConfigStagedImportSessionsExpired removes every entry when all are expired', () => {
  const past = Date.now() - 10_000
  faProgramConfigImportStagedSessions.set('a1', {
    data: {},
    expiresAt: past,
    parts: {
      keybinds: 'absent',
      programSettings: 'absent',
      programStyling: 'absent'
    }
  })
  faProgramConfigImportStagedSessions.set('a2', {
    data: {},
    expiresAt: past,
    parts: {
      keybinds: 'absent',
      programSettings: 'absent',
      programStyling: 'absent'
    }
  })
  purgeFaProgramConfigStagedImportSessionsExpired()
  expect(faProgramConfigImportStagedSessions.size).toBe(0)
})

test('Test that purgeFaProgramConfigStagedImportSessionsExpired keeps every entry when all are unexpired', () => {
  const future = Date.now() + 10_000
  faProgramConfigImportStagedSessions.set('a', {
    data: {},
    expiresAt: future,
    parts: {
      keybinds: 'absent',
      programSettings: 'absent',
      programStyling: 'absent'
    }
  })
  faProgramConfigImportStagedSessions.set('b', {
    data: {},
    expiresAt: future,
    parts: {
      keybinds: 'absent',
      programSettings: 'absent',
      programStyling: 'absent'
    }
  })
  purgeFaProgramConfigStagedImportSessionsExpired()
  expect(faProgramConfigImportStagedSessions.size).toBe(2)
})
