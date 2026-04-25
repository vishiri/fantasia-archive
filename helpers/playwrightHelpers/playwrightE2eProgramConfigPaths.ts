import fs from 'node:fs'
import path from 'node:path'

import type { ElectronApplication } from 'playwright'

import { getFaPlaywrightIsolatedUserDataDir } from './playwrightUserDataReset'

/**
 * Keep in lockstep with 'src-electron/mainScripts/programConfig/faProgramConfigE2ePathOverride.ts'
 * 'globalThis' keys (Playwright E2E main-process hooks; helpers must not import main bundles).
 */
const FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH = '__faE2eSetNextProgramConfigExportPath' as const
const FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH = '__faE2eSetNextProgramConfigImportPath' as const

const BLANK_FACONFIG_PATTERN = /^blank_.*\.faconfig$/u

/**
 * Removes prior E2E '.faconfig' artifacts in the Playwright userData tree so a run starts clean.
 * Safe when the directory is missing. Usually followed by 'resetFaPlaywrightIsolatedUserData()'.
 */
export function removePlaywrightE2eBlankFaconfigFilesIfPresent (): void {
  const dir = getFaPlaywrightIsolatedUserDataDir()
  if (!fs.existsSync(dir)) {
    return
  }
  for (const name of fs.readdirSync(dir)) {
    if (BLANK_FACONFIG_PATTERN.test(name)) {
      try {
        fs.unlinkSync(path.join(dir, name))
      } catch {
        // ignore: best-effort cleanup
      }
    }
  }
}

/**
 * Resolves a basename under the Playwright-isolated userData path (where Electron stores the same
 * 'electron-store' files as the running E2E app).
 */
export function getPlaywrightE2eUserDataFilePath (fileName: string): string {
  return path.join(getFaPlaywrightIsolatedUserDataDir(), fileName)
}

type T_mainGlobalE2eSetterArg = { k: string, p: string }

async function e2eInvokeMainPathSetter (electronApp: ElectronApplication, arg: T_mainGlobalE2eSetterArg): Promise<void> {
  /**
   * Playwright 'ElectronApplication.evaluate' runs in the main process; its callback receives
   * the 'electron' module as the first parameter when present in typings.
   */
  await electronApp.evaluate(
    (_crossExports: unknown, a: T_mainGlobalE2eSetterArg) => {
      const g = globalThis as unknown as Record<string, ((v: string) => void) | undefined>
      g[a.k]?.(a.p)
    },
    arg
  )
}

/**
 * Tells the Electron main process the absolute path of the next program-config export (E2E only).
 */
export async function e2eSetNextProgramConfigExportPath (electronApp: ElectronApplication, fileName: string): Promise<void> {
  await e2eInvokeMainPathSetter(electronApp, {
    k: FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH,
    p: getPlaywrightE2eUserDataFilePath(fileName)
  })
}

/**
 * Tells the Electron main process the absolute path of the next program-config import pick (E2E only).
 */
export async function e2eSetNextProgramConfigImportPath (electronApp: ElectronApplication, fileName: string): Promise<void> {
  await e2eInvokeMainPathSetter(electronApp, {
    k: FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH,
    p: getPlaywrightE2eUserDataFilePath(fileName)
  })
}

const E2E_FACONFIG_BASENAMES = [
  'blank_settings.faconfig',
  'blank_keybinds.faconfig',
  'blank_css.faconfig'
] as const

/**
 * Unlinks the three known E2E basenames; ignores missing files and errors.
 */
export function tryUnlinkE2eProgramConfigFixtureFiles (): void {
  for (const name of E2E_FACONFIG_BASENAMES) {
    const full = getPlaywrightE2eUserDataFilePath(name)
    try {
      if (fs.existsSync(full)) {
        fs.unlinkSync(full)
      }
    } catch {
      // ignore: cleanup only
    }
  }
}
