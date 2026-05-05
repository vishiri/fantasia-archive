import fs from 'node:fs'
import path from 'node:path'

import type { ElectronApplication } from 'playwright'

import { getFaPlaywrightIsolatedUserDataDir } from './playwrightUserDataReset'

/**
 * Keep in lockstep with 'src-electron/mainScripts/projectManagement/faProjectManagementE2ePathOverride.ts'
 * globalThis key for Playwright E2E main-process hooks.
 */
const FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH = '__faE2eSetNextProjectCreatePath' as const

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
  const abs = path.join(getFaPlaywrightIsolatedUserDataDir(), baseName)
  await e2eInvokeMainPathSetter(electronApp, {
    k: FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH,
    p: abs
  })
}

/**
 * Best-effort unlink of a '.faproject' under isolated Playwright userData.
 */
export function tryUnlinkE2eFaprojectFixture (baseName: string): void {
  const p = path.join(getFaPlaywrightIsolatedUserDataDir(), baseName)
  try {
    fs.unlinkSync(p)
  } catch {
    // ignore
  }
}
