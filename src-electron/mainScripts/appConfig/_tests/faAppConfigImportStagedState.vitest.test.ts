import { afterEach, beforeEach, expect, test } from 'vitest'

import { faAppConfigImportStagedSessions, purgeFaAppConfigStagedImportSessionsExpired, pathLooksLikeFaconfigFile } from '../faAppConfigImportStagedStateWiring'

beforeEach(() => {
  faAppConfigImportStagedSessions.clear()
})

afterEach(() => {
  faAppConfigImportStagedSessions.clear()
})

test('Test that pathLooksLikeFaconfigFile is case-insensitive on extension', () => {
  expect(pathLooksLikeFaconfigFile('C:\\x.FACONFIG')).toBe(true)
  expect(pathLooksLikeFaconfigFile('a.json')).toBe(false)
  expect(pathLooksLikeFaconfigFile('C:\\a.faconfig.bak')).toBe(false)
  expect(pathLooksLikeFaconfigFile('.faconfig')).toBe(true)
  expect(pathLooksLikeFaconfigFile('')).toBe(false)
  expect(pathLooksLikeFaconfigFile('config.faconfig extra')).toBe(false)
})

test('Test that purgeFaAppConfigStagedImportSessionsExpired removes old sessions', () => {
  faAppConfigImportStagedSessions.set('old', {
    data: {},
    expiresAt: Date.now() - 1,
    parts: {
      keybinds: 'absent',
      appNoteboard: 'absent',
      appSettings: 'absent',
      appStyling: 'absent'
    }
  })
  faAppConfigImportStagedSessions.set('new', {
    data: {},
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'absent',
      appNoteboard: 'absent',
      appSettings: 'absent',
      appStyling: 'absent'
    }
  })
  purgeFaAppConfigStagedImportSessionsExpired()
  expect(faAppConfigImportStagedSessions.has('old')).toBe(false)
  expect(faAppConfigImportStagedSessions.has('new')).toBe(true)
})

test('Test that purgeFaAppConfigStagedImportSessionsExpired is a no-op on an empty map', () => {
  faAppConfigImportStagedSessions.clear()
  purgeFaAppConfigStagedImportSessionsExpired()
  expect(faAppConfigImportStagedSessions.size).toBe(0)
})

test('Test that purgeFaAppConfigStagedImportSessionsExpired removes every entry when all are expired', () => {
  const past = Date.now() - 10_000
  faAppConfigImportStagedSessions.set('a1', {
    data: {},
    expiresAt: past,
    parts: {
      keybinds: 'absent',
      appNoteboard: 'absent',
      appSettings: 'absent',
      appStyling: 'absent'
    }
  })
  faAppConfigImportStagedSessions.set('a2', {
    data: {},
    expiresAt: past,
    parts: {
      keybinds: 'absent',
      appNoteboard: 'absent',
      appSettings: 'absent',
      appStyling: 'absent'
    }
  })
  purgeFaAppConfigStagedImportSessionsExpired()
  expect(faAppConfigImportStagedSessions.size).toBe(0)
})

test('Test that purgeFaAppConfigStagedImportSessionsExpired keeps every entry when all are unexpired', () => {
  const future = Date.now() + 10_000
  faAppConfigImportStagedSessions.set('a', {
    data: {},
    expiresAt: future,
    parts: {
      keybinds: 'absent',
      appNoteboard: 'absent',
      appSettings: 'absent',
      appStyling: 'absent'
    }
  })
  faAppConfigImportStagedSessions.set('b', {
    data: {},
    expiresAt: future,
    parts: {
      keybinds: 'absent',
      appNoteboard: 'absent',
      appSettings: 'absent',
      appStyling: 'absent'
    }
  })
  purgeFaAppConfigStagedImportSessionsExpired()
  expect(faAppConfigImportStagedSessions.size).toBe(2)
})
