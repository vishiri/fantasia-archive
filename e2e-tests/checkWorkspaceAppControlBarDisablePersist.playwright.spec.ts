import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  expectFaPlaywrightE2eHashRoute,
  expectFaPlaywrightE2eWorkspaceShell
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppShellAssertions'
import {
  navigateFaPlaywrightE2eToSplashRoute
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import { clickFaPlaywrightE2eSplashResumePrimarySegment } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eSplashResume'
import {
  e2eSetNextProjectCreatePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

/**
 * Extra env settings to trigger E2E via Playwright (isolated userData).
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  createBtn: 'dialogNewProject-button-create',
  nameInput: 'dialogNewProject-input-name',
  projectAppControlBar: 'projectAppControlBar',
  projectAppControlBarAdvancedSearchGuideButton: 'projectAppControlBar-advancedSearchGuideButton',
  projectAppControlBarKeyboardShortcutsButton: 'projectAppControlBar-keyboardShortcutsButton',
  projectAppControlBarTipsTricksTriviaButton: 'projectAppControlBar-tipsTricksTriviaButton',
  projectAppControlBarToggleHierarchyTreeButton: 'projectAppControlBar-toggleHierarchyTreeButton',
  splashNew: 'splashPage-btn-new'
} as const

const DISABLE_GUIDES_E2E_FAPROJECT = 'e2e-app-control-bar-disable-guides.faproject'
const DISABLE_GUIDES_E2E_PROJECT_NAME = 'E2E disable app control bar guides project'
const USER_SETTINGS_PERSIST_SETTLE_MS = 750

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, DISABLE_GUIDES_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(DISABLE_GUIDES_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, DISABLE_GUIDES_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function patchUserSettingsSilentlyViaPinia (
  page: Page,
  patch: Partial<I_faUserSettings>
): Promise<void> {
  await page.evaluate(async (settingsPatch) => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                patchSettingsSilently?: (update: Record<string, unknown>) => Promise<void>
              }>
            }
          }
        }
      }
    }
    const userSettingsStore = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaUserSettings')
    if (typeof userSettingsStore?.patchSettingsSilently !== 'function') {
      throw new Error('S_FaUserSettings.patchSettingsSilently missing in E2E app')
    }
    await userSettingsStore.patchSettingsSilently(settingsPatch)
  }, patch)
}

test.describe.serial('Opened documents E2E — disable app control bar guides before cold restart', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({
    timeout: 180_000
  })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      afterIsolationResetBeforeLaunch (): void {
        tryUnlinkE2eFaprojectFixture(DISABLE_GUIDES_E2E_FAPROJECT)
      },
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
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
      electronApp,
      suiteTestInfo
    })
  })

  test('disableAppControlBarGuides hides guide buttons but keeps tree toggle', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    await patchUserSettingsSilentlyViaPinia(appWindow, {
      disableAppControlBarGuides: true
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarKeyboardShortcutsButton}"]`
      )
    ).toHaveCount(0)
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarAdvancedSearchGuideButton}"]`
      )
    ).toHaveCount(0)
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarTipsTricksTriviaButton}"]`
      )
    ).toHaveCount(0)
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarToggleHierarchyTreeButton}"]`
      )
    ).toHaveCount(1)
    await appWindow.waitForTimeout(USER_SETTINGS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps disabled app control bar guides', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({
    timeout: 180_000
  })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      dismissStartupTips: true,
      renderDelayMs: FA_FRONTEND_RENDER_TIMER,
      resetUserData: false,
      testInfo
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Cold restart keeps disableAppControlBarGuides and hides guide buttons', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, DISABLE_GUIDES_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarKeyboardShortcutsButton}"]`
      )
    ).toHaveCount(0)
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarAdvancedSearchGuideButton}"]`
      )
    ).toHaveCount(0)
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarTipsTricksTriviaButton}"]`
      )
    ).toHaveCount(0)
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarToggleHierarchyTreeButton}"]`
      )
    ).toHaveCount(1)
  })
})
