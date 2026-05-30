import fs from 'node:fs'
import path from 'node:path'

import type { ElectronApplication } from 'playwright'
import { Result } from 'neverthrow'

import { getFaPlaywrightIsolatedUserDataDir } from 'app/helpers/playwrightHelpers_universal/playwrightUserDataReset'

function resolveE2eIsolatedUserDataFaprojectPath (baseName: string): string {
  return path.join(getFaPlaywrightIsolatedUserDataDir(), baseName)
}

import {
  FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH,
  FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH
} from 'app/src-electron/mainScripts/projectManagement/functions/faProjectManagementE2ePathOverride'

type T_mainGlobalE2eSetterArg = { k: string, p: string }

async function e2eInvokeMainPathSetter (electronApp: ElectronApplication, arg: T_mainGlobalE2eSetterArg): Promise<void> {
  await electronApp.evaluate(
    (_crossExports: unknown, a: T_mainGlobalE2eSetterArg) => {
      const g = globalThis as unknown as Record<string, ((v: string) => void) | undefined>
      g[a.k]?.(a.p)
    },
    arg
  )
}

/**
 * Tells Electron main the absolute path for the next '.faproject' create flow (E2E only; native dialog skipped).
 */
export async function e2eSetNextProjectCreatePath (electronApp: ElectronApplication, baseName: string): Promise<void> {
  const abs = resolveE2eIsolatedUserDataFaprojectPath(baseName)
  await e2eInvokeMainPathSetter(electronApp, {
    k: FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH,
    p: abs
  })
}

/**
 * Tells Electron main the absolute path for the next open-project flow (E2E only; native open dialog skipped).
 */
export async function e2eSetNextProjectOpenPath (electronApp: ElectronApplication, baseName: string): Promise<void> {
  const abs = resolveE2eIsolatedUserDataFaprojectPath(baseName)
  await e2eInvokeMainPathSetter(electronApp, {
    k: FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH,
    p: abs
  })
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
