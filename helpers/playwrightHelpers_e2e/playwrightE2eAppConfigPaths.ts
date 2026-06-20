import fs from 'node:fs'
import path from 'node:path'

import type { ElectronApplication } from 'playwright'
import { Result } from 'neverthrow'

import { getFaPlaywrightIsolatedUserDataDir } from 'app/helpers/playwrightHelpers_universal/playwrightUserDataReset'

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
      void Result.fromThrowable(
        (): void => fs.unlinkSync(path.join(dir, name)),
        (): undefined => undefined
      )()
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

async function e2eStageAppConfigPathViaRendererBridge (
  electronApp: ElectronApplication,
  filePath: string,
  kind: 'export' | 'import'
): Promise<void> {
  const page = await electronApp.firstWindow()
  const staged = await page.evaluate(async (args: { filePath: string, kind: 'export' | 'import' }) => {
    const api = window.faContentBridgeAPIs?.faAppConfig
    if (api === undefined) {
      return false
    }
    if (args.kind === 'export') {
      return await api.stageE2eNextExportPath(args.filePath)
    }
    return await api.stageE2eNextImportPath(args.filePath)
  }, {
    filePath,
    kind,
  })
  if (staged !== true) {
    throw new Error(`Failed to stage E2E app-config ${kind} path in main process.`)
  }
}

/**
 * Tells the Electron main process the absolute path of the next app-config export (E2E only).
 */
export async function e2eSetNextAppConfigExportPath (electronApp: ElectronApplication, fileName: string): Promise<void> {
  await e2eStageAppConfigPathViaRendererBridge(
    electronApp,
    getPlaywrightE2eUserDataFilePath(fileName),
    'export'
  )
}

/**
 * Tells the Electron main process the absolute path of the next app-config import pick (E2E only).
 */
export async function e2eSetNextAppConfigImportPath (electronApp: ElectronApplication, fileName: string): Promise<void> {
  await e2eStageAppConfigPathViaRendererBridge(
    electronApp,
    getPlaywrightE2eUserDataFilePath(fileName),
    'import'
  )
}

const E2E_FACONFIG_BASENAMES = [
  'blank_settings.faconfig',
  'blank_keybinds.faconfig',
  'blank_css.faconfig',
  'blank_noteboard.faconfig'
] as const

/**
 * Unlinks the four known E2E basenames; ignores missing files and errors.
 */
export function tryUnlinkE2eAppConfigFixtureFiles (): void {
  for (const name of E2E_FACONFIG_BASENAMES) {
    const full = getPlaywrightE2eUserDataFilePath(name)
    void Result.fromThrowable(
      (): void => {
        if (fs.existsSync(full)) {
          fs.unlinkSync(full)
        }
      },
      (): undefined => undefined
    )()
  }
}
