import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import type { ElectronApplication, Page } from 'playwright'
import type { TestInfo } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { e2eExpectFaActiveProjectStoreName } from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  e2eSetNextProjectCreatePath,
  getE2eFaprojectFixtureAbsolutePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'

/**
 * Extra env settings: default E2E isolation; FA_E2E_OS_OPEN stays off here so staging matches ordinary suites.
 */
const extraEnvSettingsPrep = {
  TEST_ENV: 'e2e' as const
}

/**
 * Argv replay uses the same MIME registration path as installers; staged file lives outside playwright-user-data
 * so a fresh profile reset cannot delete it between launches.
 */
const OS_OPEN_ARGV_TEMP_FAPROJECT = path.join(
  os.tmpdir(),
  'fantasia-archive-playwright-os-open',
  'argv-cold-open.faproject'
)

const selectorList = {
  createBtn: 'dialogNewProject-button-create',
  nameInput: 'dialogNewProject-input-name',
  splashNew: 'splashPage-btn-new'
} as const

const SOURCE_FAPROJECT_BASENAME = 'e2e-os-argv-source.faproject'

const STAGING_PROJECT_DISPLAY_NAME = 'E2E argv open staging project'

function interpolateFaProjectSessionNotify (
  template: string,
  projectName: string
): string {
  return template.split('{projectName}').join(projectName)
}

function assertFaprojectFixtureHasContent (absolutePath: string): void {
  expect(fs.existsSync(absolutePath)).toBe(true)
  const stat = fs.statSync(absolutePath)
  expect(stat.isFile()).toBe(true)
  expect(stat.size).toBeGreaterThan(0)
}

function ensureArgvTempRemoved (): void {
  fs.rmSync(path.dirname(OS_OPEN_ARGV_TEMP_FAPROJECT), {
    force: true,
    recursive: true
  })
}

test.describe.serial('OS-open argv prep: writable .faproject copy', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      afterIsolationResetBeforeLaunch (): void {
        tryUnlinkE2eFaprojectFixture(SOURCE_FAPROJECT_BASENAME)
        ensureArgvTempRemoved()
      },
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettingsPrep.TEST_ENV
        }
      },
      dismissStartupTips: true,
      renderDelayMs: FA_FRONTEND_RENDER_TIMER,
      testInfo
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      async afterClose (): Promise<void> {
        tryUnlinkE2eFaprojectFixture(SOURCE_FAPROJECT_BASENAME)
      },
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * Creates **[SOURCE_FAPROJECT_BASENAME]** under isolated userData via the splash flow, then clones it beside the OS tempdir.
   *
   * - The duplicate stays outside playwright-user-data so argv replay can reset the profile cleanly.
   */
  test('stages argv-fixture project via splash Create new project then copies SQLite to argv temp dir', async () => {
    await e2eSetNextProjectCreatePath(electronApp, SOURCE_FAPROJECT_BASENAME)
    await appWindow.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
    await appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(STAGING_PROJECT_DISPLAY_NAME)
    await appWindow.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
    await expect(appWindow.locator('#dialogNewProject-title')).toBeHidden({
      timeout: 15_000
    })

    await e2eExpectFaActiveProjectStoreName(appWindow, STAGING_PROJECT_DISPLAY_NAME)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectCreated,
      STAGING_PROJECT_DISPLAY_NAME
    ))).toBeVisible()

    const sourceAbs = getE2eFaprojectFixtureAbsolutePath(SOURCE_FAPROJECT_BASENAME)
    assertFaprojectFixtureHasContent(sourceAbs)

    fs.mkdirSync(path.dirname(OS_OPEN_ARGV_TEMP_FAPROJECT), { recursive: true })
    fs.copyFileSync(sourceAbs, OS_OPEN_ARGV_TEMP_FAPROJECT)
    assertFaprojectFixtureHasContent(OS_OPEN_ARGV_TEMP_FAPROJECT)
  })
})

test.describe.serial('OS-open argv: cold Electron launch loads project path', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    assertFaprojectFixtureHasContent(OS_OPEN_ARGV_TEMP_FAPROJECT)

    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          FA_E2E_OS_OPEN: '1',
          TEST_ENV: 'e2e'
        }
      },
      dismissStartupTips: true,
      electronLaunchAdditionalArgs: [OS_OPEN_ARGV_TEMP_FAPROJECT],
      renderDelayMs: FA_FRONTEND_RENDER_TIMER,
      testInfo
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      async afterClose (): Promise<void> {
        ensureArgvTempRemoved()
      },
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * Mirrors double-click associations: Electron receives an absolute `.faproject` after the packaged main bundle path,
   * main parses argv, waits for handshake, and the renderer **`loadExistingProject`** path loads the SQLite session once ready.
   */
  test('loads the staged SQLite project when process.argv carries the copied .faproject path after main JS', async () => {
    const dbgMain = await electronApp.evaluate(() => ({
      argv: [...process.argv],
      faOs: process.env.FA_E2E_OS_OPEN,
      cwd: process.cwd(),
      testEnv: process.env.TEST_ENV
    }))
    const hasFaprojectArgv = dbgMain.argv.some((a: string): boolean =>
      a.toLowerCase().endsWith('.faproject'))

    expect(dbgMain.testEnv).toBe('e2e')
    expect(dbgMain.faOs).toBe('1')
    expect(
      hasFaprojectArgv,
      `Expected .faproject in process.argv (${JSON.stringify(dbgMain)})`
    ).toBe(true)

    await e2eExpectFaActiveProjectStoreName(appWindow, STAGING_PROJECT_DISPLAY_NAME)
    await expect(appWindow.locator('#dialogNewProject-title')).toHaveCount(0)
  })
})
