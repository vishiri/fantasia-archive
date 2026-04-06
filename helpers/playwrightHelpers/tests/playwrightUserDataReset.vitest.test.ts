import fs from 'node:fs'
import path from 'node:path'

import { expect, test, vi } from 'vitest'

import * as playwrightUserDataReset from '../playwrightUserDataReset'

import packageJSON from '../../../package.json' with { type: 'json' }
import { PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME } from '../../../src-electron/mainScripts/appIdentity/playwrightIsolatedUserDataDirName'
import { resolveFaPlaywrightIsolatedUserDataDir } from '../playwrightUserDataReset'

/**
 * resolveFaPlaywrightIsolatedUserDataDir
 * Windows uses APPDATA when set.
 */
test('resolveFaPlaywrightIsolatedUserDataDir uses APPDATA on win32', () => {
  expect(
    resolveFaPlaywrightIsolatedUserDataDir({
      env: {
        APPDATA: 'C:\\Users\\tester\\AppData\\Roaming'
      },
      homedir: 'C:\\Users\\tester',
      platform: 'win32'
    })
  ).toBe(
    path.join(
      'C:\\Users\\tester\\AppData\\Roaming',
      packageJSON.name,
      PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME
    )
  )
})

/**
 * resolveFaPlaywrightIsolatedUserDataDir
 * Windows falls back to homedir AppData Roaming when APPDATA is unset.
 */
test('resolveFaPlaywrightIsolatedUserDataDir uses homedir AppData Roaming on win32 when APPDATA is unset', () => {
  expect(
    resolveFaPlaywrightIsolatedUserDataDir({
      env: {},
      homedir: 'C:\\Users\\tester',
      platform: 'win32'
    })
  ).toBe(
    path.join(
      'C:\\Users\\tester',
      'AppData',
      'Roaming',
      packageJSON.name,
      PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME
    )
  )
})

/**
 * resolveFaPlaywrightIsolatedUserDataDir
 * Windows falls back to homedir AppData Roaming when APPDATA is an empty string.
 */
test('resolveFaPlaywrightIsolatedUserDataDir uses homedir AppData Roaming on win32 when APPDATA is empty', () => {
  expect(
    resolveFaPlaywrightIsolatedUserDataDir({
      env: {
        APPDATA: ''
      },
      homedir: 'C:\\Users\\tester',
      platform: 'win32'
    })
  ).toBe(
    path.join(
      'C:\\Users\\tester',
      'AppData',
      'Roaming',
      packageJSON.name,
      PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME
    )
  )
})

/**
 * resetFaPlaywrightIsolatedUserData
 * Invokes rmSync with the same absolute path getFaPlaywrightIsolatedUserDataDir returns (ESM keeps an internal binding, so the getter is asserted instead of mocking it).
 */
test('resetFaPlaywrightIsolatedUserData calls rmSync with getFaPlaywrightIsolatedUserDataDir path', () => {
  const expectedPath = playwrightUserDataReset.getFaPlaywrightIsolatedUserDataDir()
  const rmSyncSpy = vi.spyOn(fs, 'rmSync').mockImplementation(() => {})

  playwrightUserDataReset.resetFaPlaywrightIsolatedUserData()

  expect(rmSyncSpy).toHaveBeenCalledWith(expectedPath, {
    force: true,
    recursive: true
  })
  rmSyncSpy.mockRestore()
})

/**
 * resolveFaPlaywrightIsolatedUserDataDir
 * macOS uses ~/Library/Application Support.
 */
test('resolveFaPlaywrightIsolatedUserDataDir uses Application Support on darwin', () => {
  expect(
    resolveFaPlaywrightIsolatedUserDataDir({
      env: {},
      homedir: '/Users/tester',
      platform: 'darwin'
    })
  ).toBe(
    path.join(
      '/Users/tester',
      'Library',
      'Application Support',
      packageJSON.name,
      PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME
    )
  )
})

/**
 * resolveFaPlaywrightIsolatedUserDataDir
 * Linux uses XDG_CONFIG_HOME when set.
 */
test('resolveFaPlaywrightIsolatedUserDataDir uses XDG_CONFIG_HOME on linux when set', () => {
  expect(
    resolveFaPlaywrightIsolatedUserDataDir({
      env: {
        XDG_CONFIG_HOME: '/home/tester/.config'
      },
      homedir: '/home/tester',
      platform: 'linux'
    })
  ).toBe(
    path.join(
      '/home/tester/.config',
      packageJSON.name,
      PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME
    )
  )
})

/**
 * resolveFaPlaywrightIsolatedUserDataDir
 * Linux falls back to ~/.config when XDG_CONFIG_HOME is unset.
 */
test('resolveFaPlaywrightIsolatedUserDataDir uses ~/.config on linux without XDG_CONFIG_HOME', () => {
  expect(
    resolveFaPlaywrightIsolatedUserDataDir({
      env: {},
      homedir: '/home/tester',
      platform: 'linux'
    })
  ).toBe(
    path.join(
      '/home/tester',
      '.config',
      packageJSON.name,
      PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME
    )
  )
})
