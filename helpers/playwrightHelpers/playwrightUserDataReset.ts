import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import packageJSON from '../../package.json' with { type: 'json' }
import { PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME } from '../../src-electron/mainScripts/appIdentity/playwrightIsolatedUserDataDirName'

export type T_faPlaywrightUserDataPathInput = {
  /** Subset of process.env; only APPDATA / XDG_CONFIG_HOME are read. */
  env: Record<string, string | undefined>
  homedir: string
  platform: NodeJS.Platform
}

/**
 * Mirrors Electron 'app.getPath("appData")' layout so Playwright can delete the same
 * 'userData' subtree 'fixAppName' assigns when 'TEST_ENV' is 'components' or 'e2e'.
 * Pure function for tests; 'getFaPlaywrightIsolatedUserDataDir' delegates here.
 */
export function resolveFaPlaywrightIsolatedUserDataDir (
  input: T_faPlaywrightUserDataPathInput
): string {
  const {
    env,
    homedir: home,
    platform
  } = input

  let appDataRoot: string

  if (platform === 'win32') {
    const fromEnv = env.APPDATA
    if (fromEnv !== undefined && fromEnv !== '') {
      appDataRoot = fromEnv
    } else {
      appDataRoot = path.join(home, 'AppData', 'Roaming')
    }
  } else if (platform === 'darwin') {
    appDataRoot = path.join(home, 'Library', 'Application Support')
  } else {
    const xdg = env.XDG_CONFIG_HOME
    if (xdg !== undefined && xdg !== '') {
      appDataRoot = xdg
    } else {
      appDataRoot = path.join(home, '.config')
    }
  }

  return path.join(
    appDataRoot,
    packageJSON.name,
    PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME
  )
}

/**
 * Absolute path to the Playwright-isolated Electron 'userData' directory
 * ('…/<package.json name>/playwright-user-data').
 */
export function getFaPlaywrightIsolatedUserDataDir (): string {
  return resolveFaPlaywrightIsolatedUserDataDir({
    env: process.env as Record<string, string | undefined>,
    homedir: os.homedir(),
    platform: process.platform
  })
}

const RESET_FA_USER_DATA_MAX_ATTEMPTS = 15
const RESET_FA_USER_DATA_BASE_DELAY_MS = 80

/**
 * Windows can hold a short lock on Chromium under 'Cache' after Electron exits; a single
 * 'fs.rmSync' may throw EBUSY. Short spin-waited retries make serial E2E runs reliable.
 */
function sleepSyncForResetMs (ms: number): void {
  const end = performance.now() + Math.max(0, ms)
  while (performance.now() < end) {
    // no-op: bounded busy wait (test-only reset path, typically a few seconds total)
  }
}

/**
 * True when 'fs.rmSync' failed because a file or directory is still locked. On Windows,
 * the 'code' field is not always present on the thrown value even when the message
 * contains 'EBUSY' or 'resource busy or locked'.
 */
function isTransientUserDataRmError (e: unknown): boolean {
  if (typeof e !== 'object' || e === null) {
    return false
  }
  const err = e as NodeJS.ErrnoException
  const c = err.code
  if (c === 'EPERM' || c === 'EBUSY' || c === 'EACCES' || c === 'ENOTEMPTY') {
    return true
  }
  if (typeof err.message !== 'string') {
    return false
  }
  const m = err.message
  return (
    m.includes('EBUSY') ||
    m.includes('EPERM') ||
    m.toLowerCase().includes('resource busy') ||
    m.toLowerCase().includes('file is being used') ||
    m.toLowerCase().includes('being used by another process')
  )
}

/**
 * Removes the entire Playwright-isolated 'userData' tree (including 'faUserSettings.json'
 * and Chromium profile folders) so the next 'electron.launch' starts from defaults.
 * Retries on EBUSY and common transient Windows file-lock codes so the next suite can
 * delete a profile a prior Electron instance recently released.
 */
export function resetFaPlaywrightIsolatedUserData (): void {
  const dir = getFaPlaywrightIsolatedUserDataDir()
  let last: unknown
  for (let attempt = 0; attempt < RESET_FA_USER_DATA_MAX_ATTEMPTS; attempt++) {
    try {
      fs.rmSync(dir, {
        force: true,
        recursive: true
      })
      return
    } catch (e) {
      last = e
      if (isTransientUserDataRmError(e)) {
        if (attempt < RESET_FA_USER_DATA_MAX_ATTEMPTS - 1) {
          sleepSyncForResetMs(RESET_FA_USER_DATA_BASE_DELAY_MS * (attempt + 1))
        }
        continue
      }
      throw e
    }
  }
  throw last
}
