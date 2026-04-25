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
 * resetFaPlaywrightIsolatedUserData
 * Retries rmSync when Chromium or the OS briefly reports EBUSY (Windows serial E2E).
 */
test('resetFaPlaywrightIsolatedUserData retries rmSync on EBUSY then succeeds', () => {
  const expectedPath = playwrightUserDataReset.getFaPlaywrightIsolatedUserDataDir()
  const busy = Object.assign(new Error('EBUSY'), { code: 'EBUSY' as const })
  const rmSyncSpy = vi.spyOn(fs, 'rmSync').mockImplementationOnce(() => {
    throw busy
  })

  playwrightUserDataReset.resetFaPlaywrightIsolatedUserData()

  expect(rmSyncSpy).toHaveBeenCalledTimes(2)
  expect(rmSyncSpy).toHaveBeenNthCalledWith(1, expectedPath, {
    force: true,
    recursive: true
  })
  expect(rmSyncSpy).toHaveBeenNthCalledWith(2, expectedPath, {
    force: true,
    recursive: true
  })
  rmSyncSpy.mockRestore()
})

/**
 * resetFaPlaywrightIsolatedUserData
 * Rethrows immediately when rmSync reports a code that is not a transient file-lock case.
 */
test('resetFaPlaywrightIsolatedUserData rethrows a non-retryable rmSync error', () => {
  const oops = Object.assign(new Error('boom'), { code: 'EPIPE' as const })
  const rmSyncSpy = vi.spyOn(fs, 'rmSync').mockImplementation(() => {
    throw oops
  })

  expect(() => {
    playwrightUserDataReset.resetFaPlaywrightIsolatedUserData()
  }).toThrow(oops)
  expect(rmSyncSpy).toHaveBeenCalledTimes(1)
  rmSyncSpy.mockRestore()
})

/**
 * resetFaPlaywrightIsolatedUserData
 * A thrown primitive string is not a transient lock pattern; rethrow immediately.
 */
test('resetFaPlaywrightIsolatedUserData rethrows when rmSync throws a string', () => {
  const rmSyncSpy = vi.spyOn(fs, 'rmSync').mockImplementation(() => {
    // exercise non-object 'unknown' in 'isTransientUserDataRmError' (rare in production)
    // eslint-disable-next-line no-throw-literal -- intentional primitive rejection path
    throw 'not an error object'
  })

  expect(() => {
    playwrightUserDataReset.resetFaPlaywrightIsolatedUserData()
  }).toThrow('not an error object')
  expect(rmSyncSpy).toHaveBeenCalledTimes(1)
  rmSyncSpy.mockRestore()
})

/**
 * resetFaPlaywrightIsolatedUserData
 * 'throw null' reaches the guard; not a transient lock; rethrow.
 */
test('resetFaPlaywrightIsolatedUserData rethrows when rmSync throws null', () => {
  const rmSyncSpy = vi.spyOn(fs, 'rmSync').mockImplementation(() => {
    // exercise 'e === null' branch in 'isTransientUserDataRmError'
    // eslint-disable-next-line no-throw-literal
    throw null
  })

  expect(() => {
    playwrightUserDataReset.resetFaPlaywrightIsolatedUserData()
  }).toThrow()
  expect(rmSyncSpy).toHaveBeenCalledTimes(1)
  rmSyncSpy.mockRestore()
})

/**
 * resetFaPlaywrightIsolatedUserData
 * A thrown object with a non-string 'message' and no known 'code' is not treated as a lock; rethrow.
 */
test('resetFaPlaywrightIsolatedUserData rethrows when message is not a string', () => {
  const weird = Object.assign(
    {
      name: 'x',
      code: 'UNKNOWN'
    } as NodeJS.ErrnoException,
    { message: 42 } as never
  )
  const rmSyncSpy = vi.spyOn(fs, 'rmSync').mockImplementation(() => {
    throw weird
  })

  expect(() => {
    playwrightUserDataReset.resetFaPlaywrightIsolatedUserData()
  }).toThrow(weird)
  expect(rmSyncSpy).toHaveBeenCalledTimes(1)
  rmSyncSpy.mockRestore()
})

/**
 * resetFaPlaywrightIsolatedUserData
 * After the maximum attempts, propagates the last EBUSY (or other retryable) error.
 */
test('resetFaPlaywrightIsolatedUserData throws after max attempts on persistent EBUSY', () => {
  const busy = Object.assign(new Error('EBUSY'), { code: 'EBUSY' as const })
  const rmSyncSpy = vi.spyOn(fs, 'rmSync').mockImplementation(() => {
    throw busy
  })

  expect(() => {
    playwrightUserDataReset.resetFaPlaywrightIsolatedUserData()
  }).toThrow(busy)
  expect(rmSyncSpy).toHaveBeenCalledTimes(15)
  rmSyncSpy.mockRestore()
}, 20_000)

/**
 * resetFaPlaywrightIsolatedUserData
 * Some Windows 'rmSync' errors carry lock text in 'message' without a reliable 'code' field; still retry.
 */
test('resetFaPlaywrightIsolatedUserData retries when rmSync message implies file lock', () => {
  const expectedPath = playwrightUserDataReset.getFaPlaywrightIsolatedUserDataDir()
  const msgOnly = new Error('Error: EBUSY: resource busy or locked, unlink')
  const rmSyncSpy = vi.spyOn(fs, 'rmSync').mockImplementationOnce(() => {
    throw msgOnly
  })

  playwrightUserDataReset.resetFaPlaywrightIsolatedUserData()

  expect(rmSyncSpy).toHaveBeenCalledTimes(2)
  expect(rmSyncSpy).toHaveBeenNthCalledWith(1, expectedPath, {
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
 * Linux falls back to ~/.config when XDG_CONFIG_HOME is an empty string.
 */
test('resolveFaPlaywrightIsolatedUserDataDir uses ~/.config on linux when XDG_CONFIG_HOME is empty', () => {
  expect(
    resolveFaPlaywrightIsolatedUserDataDir({
      env: {
        XDG_CONFIG_HOME: ''
      },
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
