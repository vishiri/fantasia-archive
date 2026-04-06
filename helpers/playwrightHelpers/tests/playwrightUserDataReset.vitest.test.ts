import path from 'node:path'

import { expect, test } from 'vitest'

import packageJSON from '../../../package.json' with { type: 'json' }
import { PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME } from '../../../src-electron/mainScripts/playwrightIsolatedUserDataDirName'
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
