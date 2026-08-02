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
  hierarchyTreeHost: 'projectHierarchyTree-host',
  splashNew: 'splashPage-btn-new'
} as const

const SCROLL_RESTORE_E2E_FAPROJECT = 'e2e-hierarchy-scroll-restore.faproject'
const SCROLL_RESTORE_E2E_PROJECT_NAME = 'E2E hierarchy scroll restore project'
/** Matches S_FaProjectHierarchyTree UI_STATE_PERSIST_DEBOUNCE_MS with headroom. */
const HIERARCHY_UI_STATE_PERSIST_SETTLE_MS = 500
const SCROLL_RESTORE_E2E_SCROLL_TOP_PX = 48

let e2eScrollRestoreTargetPx = 0

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, SCROLL_RESTORE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(SCROLL_RESTORE_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, SCROLL_RESTORE_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function persistHierarchyScrollTopPx (
  page: Page,
  scrollTopPx: number
): Promise<void> {
  const saved = await page.evaluate(async (nextScrollTopPx) => {
    const management = window.faContentBridgeAPIs?.projectManagement
    if (management === undefined) {
      throw new Error('Project management bridge unavailable')
    }
    return await management.setHierarchyTreeUiState({
      scrollTopPx: nextScrollTopPx
    })
  }, scrollTopPx)
  expect(saved).toBe(true)
}

async function readHierarchyScrollTopPx (page: Page): Promise<number> {
  return page.evaluate(async () => {
    const management = window.faContentBridgeAPIs?.projectManagement
    if (management === undefined) {
      throw new Error('Project management bridge unavailable')
    }
    const state = await management.getHierarchyTreeUiState()
    return state.scrollTopPx
  })
}

async function readHierarchyStoreScrollTopPx (page: Page): Promise<number> {
  return page.evaluate(() => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                uiState?: { scrollTopPx?: number }
              }>
            }
          }
        }
      }
    }
    const store = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get(
      'S_FaProjectHierarchyTree'
    )
    return store?.uiState?.scrollTopPx ?? -1
  })
}

test.describe.serial('Hierarchy tree E2E — scrollTopPx persist before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(SCROLL_RESTORE_E2E_FAPROJECT)
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

  test('Persist hierarchy_tree_ui_state scrollTopPx', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })

    e2eScrollRestoreTargetPx = SCROLL_RESTORE_E2E_SCROLL_TOP_PX
    await persistHierarchyScrollTopPx(appWindow, e2eScrollRestoreTargetPx)
    await expect.poll(async () => {
      return await readHierarchyScrollTopPx(appWindow)
    }, { timeout: 10_000 }).toBe(e2eScrollRestoreTargetPx)

    await appWindow.waitForTimeout(HIERARCHY_UI_STATE_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Hierarchy tree E2E — cold restore scrollTopPx', () => {
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

  test('Cold restart restores scrollTopPx in bridge and hierarchy store', async () => {
    expect(e2eScrollRestoreTargetPx).toBe(SCROLL_RESTORE_E2E_SCROLL_TOP_PX)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, SCROLL_RESTORE_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })

    await expect.poll(async () => {
      return await readHierarchyScrollTopPx(appWindow)
    }, { timeout: 15_000 }).toBe(e2eScrollRestoreTargetPx)

    await expect.poll(async () => {
      return await readHierarchyStoreScrollTopPx(appWindow)
    }, { timeout: 15_000 }).toBe(e2eScrollRestoreTargetPx)
  })
})
