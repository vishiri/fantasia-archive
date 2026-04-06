import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

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

/**
 * Removes the entire Playwright-isolated 'userData' tree (including 'faUserSettings.json'
 * and Chromium profile folders) so the next 'electron.launch' starts from defaults.
 */
export function resetFaPlaywrightIsolatedUserData (): void {
  fs.rmSync(getFaPlaywrightIsolatedUserDataDir(), {
    force: true,
    recursive: true
  })
}
