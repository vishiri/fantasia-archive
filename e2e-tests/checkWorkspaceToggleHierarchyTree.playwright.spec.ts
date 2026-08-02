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
  hierarchyTreeHost: 'projectHierarchyTree-host',
  nameInput: 'dialogNewProject-input-name',
  projectAppControlBar: 'projectAppControlBar',
  projectAppControlBarFixedStrip: '.projectAppControlBar--fixedStrip',
  splashNew: 'splashPage-btn-new'
} as const

const FA_PLAYWRIGHT_PRESS_DEFAULT_TOGGLE_HIERARCHICAL_TREE = 'Control+Alt+Shift+T' as const

const TOGGLE_TREE_E2E_FAPROJECT = 'e2e-toggle-hierarchy-tree.faproject'
const TOGGLE_TREE_E2E_PROJECT_NAME = 'E2E toggle hierarchy tree project'
const USER_SETTINGS_PERSIST_SETTLE_MS = 750

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TOGGLE_TREE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TOGGLE_TREE_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TOGGLE_TREE_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

test.describe.serial('Opened documents E2E — toggle hierarchy tree before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(TOGGLE_TREE_E2E_FAPROJECT)
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

  test('Toggle hierarchical tree keybind hides then shows the hierarchy tree', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)

    const hierarchyHost = appWindow.locator(
      `[data-test-locator="${selectorList.hierarchyTreeHost}"]`
    )
    const fixedStrip = appWindow.locator(selectorList.projectAppControlBarFixedStrip)
    await expect(hierarchyHost).toBeVisible({ timeout: 15_000 })
    await expect(fixedStrip).not.toHaveClass(/projectAppControlBar--fixedStrip--treeHidden/)

    await appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`).click()
    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_TOGGLE_HIERARCHICAL_TREE)
    await expect(hierarchyHost).toHaveCount(0, { timeout: 15_000 })
    await expect(fixedStrip).toHaveClass(/projectAppControlBar--fixedStrip--treeHidden/)

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_TOGGLE_HIERARCHICAL_TREE)
    await expect(hierarchyHost).toBeVisible({ timeout: 15_000 })
    await expect(fixedStrip).not.toHaveClass(/projectAppControlBar--fixedStrip--treeHidden/)

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_TOGGLE_HIERARCHICAL_TREE)
    await expect(hierarchyHost).toHaveCount(0, { timeout: 15_000 })
    await expect(fixedStrip).toHaveClass(/projectAppControlBar--fixedStrip--treeHidden/)
    await appWindow.waitForTimeout(USER_SETTINGS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps hierarchy tree hidden', () => {
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

  test('Cold restart keeps hideHierarchyTree true and hides the tree host', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, TOGGLE_TREE_E2E_PROJECT_NAME)
    // Workspace drawer host is absent while hideHierarchyTree is on — skip full shell assert.
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toBeVisible({ timeout: 15_000 })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toHaveCount(0, { timeout: 15_000 })
    await expect(
      appWindow.locator(selectorList.projectAppControlBarFixedStrip)
    ).toHaveClass(/projectAppControlBar--fixedStrip--treeHidden/)
  })
})
