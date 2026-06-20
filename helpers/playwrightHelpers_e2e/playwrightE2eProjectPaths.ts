import fs from 'node:fs'
import path from 'node:path'

import type { ElectronApplication } from 'playwright'
import { Result } from 'neverthrow'

import { getFaPlaywrightIsolatedUserDataDir } from 'app/helpers/playwrightHelpers_universal/playwrightUserDataReset'

function resolveE2eIsolatedUserDataFaprojectPath (baseName: string): string {
  return path.join(getFaPlaywrightIsolatedUserDataDir(), baseName)
}

/**
 * Stages the next create/open path through the renderer bridge so main-process IPC handlers
 * receive it (Playwright 'ElectronApplication.evaluate' does not share real main 'globalThis').
 */
async function e2eStageProjectPathViaRendererBridge (
  electronApp: ElectronApplication,
  filePath: string,
  kind: 'create' | 'open'
): Promise<void> {
  const page = await electronApp.firstWindow()
  const staged = await page.evaluate(async (args: { filePath: string, kind: 'create' | 'open' }) => {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (api === undefined) {
      return false
    }
    if (args.kind === 'create') {
      return await api.stageE2eNextCreatePath(args.filePath)
    }
    return await api.stageE2eNextOpenPath(args.filePath)
  }, {
    filePath,
    kind,
  })
  if (staged !== true) {
    throw new Error(`Failed to stage E2E project ${kind} path in main process.`)
  }
}

/**
 * Tells Electron main the absolute path for the next '.faproject' create flow (E2E only; native dialog skipped).
 */
export async function e2eSetNextProjectCreatePath (electronApp: ElectronApplication, baseName: string): Promise<void> {
  const abs = resolveE2eIsolatedUserDataFaprojectPath(baseName)
  await e2eStageProjectPathViaRendererBridge(electronApp, abs, 'create')
}

/**
 * Tells Electron main the absolute path for the next open-project flow (E2E only; native open dialog skipped).
 */
export async function e2eSetNextProjectOpenPath (electronApp: ElectronApplication, baseName: string): Promise<void> {
  const abs = resolveE2eIsolatedUserDataFaprojectPath(baseName)
  await e2eStageProjectPathViaRendererBridge(electronApp, abs, 'open')
}

/**
 * Absolute '.faproject' path under isolated Playwright userData ('e2e' / component harness semantics).
 */
export function getE2eFaprojectFixtureAbsolutePath (baseName: string): string {
  return resolveE2eIsolatedUserDataFaprojectPath(baseName)
}

/**
 * Best-effort unlink of a '.faproject' under isolated Playwright userData.
 */
export function tryUnlinkE2eFaprojectFixture (baseName: string): void {
  const p = resolveE2eIsolatedUserDataFaprojectPath(baseName)
  void Result.fromThrowable(
    (): void => fs.unlinkSync(p),
    (): undefined => undefined
  )()
}
