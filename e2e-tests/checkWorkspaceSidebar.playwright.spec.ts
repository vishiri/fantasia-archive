import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { e2eExpectFaActiveProjectStoreName } from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  expectFaPlaywrightE2eHashRoute,
  expectFaPlaywrightE2eWorkspaceShell
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppShellAssertions'
import {
  navigateFaPlaywrightE2eToSplashRoute
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import {
  e2eSetNextProjectCreatePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { clickFaPlaywrightE2eSplashResumePrimarySegment } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eSplashResume'
import {
  assertFaPlaywrightE2eWorkspaceSidebarWidthNear,
  dragFaPlaywrightE2eWorkspaceSidebarSeparator,
  expectFaPlaywrightE2eWorkspaceSidebarAtDefaultWidth,
  FA_PLAYWRIGHT_E2E_WORKSPACE_SIDEBAR_PERSIST_DEBOUNCE_SETTLE_MS,
  readFaPlaywrightE2eProjectSidebarWidthFromBridge,
  readFaPlaywrightE2eWorkspaceSidebarPanelWidthPx
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eWorkspaceSidebar'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import { FA_PROJECT_SIDEBAR_MIN_WIDTH_PX } from 'app/types/I_faProjectSidebarDomain'

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
  sidebarSplitter: 'mainLayout-sidebarSplitter',
  splashNew: 'splashPage-btn-new'
} as const

const WORKSPACE_SIDEBAR_E2E_FAPROJECT = 'e2e-workspace-sidebar.faproject'

const WORKSPACE_SIDEBAR_E2E_DISPLAY_NAME = 'E2E workspace sidebar project'

/** Horizontal drag applied to the splitter separator in the first serial group. */
const WORKSPACE_SIDEBAR_E2E_DRAG_DELTA_PX = 140

/**
 * Ceiled width persisted after drag; shared with the cold-restart serial group in this file.
 */
let e2eWorkspaceSidebarPersistedWidthPx = FA_PROJECT_SIDEBAR_MIN_WIDTH_PX

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, WORKSPACE_SIDEBAR_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(WORKSPACE_SIDEBAR_E2E_DISPLAY_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, WORKSPACE_SIDEBAR_E2E_DISPLAY_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

test.describe.serial('Workspace sidebar E2E — fresh profile: drag splitter and persist width', () => {
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
        tryUnlinkE2eFaprojectFixture(WORKSPACE_SIDEBAR_E2E_FAPROJECT)
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

  /**
   * Creates a project on the workspace route, drags the splitter wider, and persists sidebar_width to SQLite.
   */
  test('Drag workspace sidebar splitter and persist ceiled width to project_data', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)

    const splitter = appWindow.locator(`[data-test-locator="${selectorList.sidebarSplitter}"]`)
    await expect(splitter).toBeVisible()

    await test.step('Splitter starts at the 375px minimum width', async () => {
      await expectFaPlaywrightE2eWorkspaceSidebarAtDefaultWidth(appWindow)
    })

    const widthBeforeDragPx = await readFaPlaywrightE2eWorkspaceSidebarPanelWidthPx(appWindow)

    await test.step('Drag the splitter separator to widen the left panel', async () => {
      await dragFaPlaywrightE2eWorkspaceSidebarSeparator(appWindow, WORKSPACE_SIDEBAR_E2E_DRAG_DELTA_PX)
      await appWindow.waitForTimeout(FA_PLAYWRIGHT_E2E_WORKSPACE_SIDEBAR_PERSIST_DEBOUNCE_SETTLE_MS)
    })

    const widthAfterDragPx = await readFaPlaywrightE2eWorkspaceSidebarPanelWidthPx(appWindow)
    expect(widthAfterDragPx).toBeGreaterThan(widthBeforeDragPx + WORKSPACE_SIDEBAR_E2E_DRAG_DELTA_PX * 0.5)

    const bridgeWidthPx = await readFaPlaywrightE2eProjectSidebarWidthFromBridge(appWindow)
    expect(bridgeWidthPx).toBeGreaterThan(FA_PROJECT_SIDEBAR_MIN_WIDTH_PX)
    assertFaPlaywrightE2eWorkspaceSidebarWidthNear(
      bridgeWidthPx,
      widthAfterDragPx,
      'bridge width vs panel width after drag'
    )

    e2eWorkspaceSidebarPersistedWidthPx = bridgeWidthPx
  })
})

test.describe.serial('Workspace sidebar E2E — cold restart: restored width from SQLite', () => {
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

  /**
   * Cold start on the warmed Playwright profile reloads the project and hydrates the prior sidebar_width KV row.
   */
  test('After app restart workspace sidebar width matches persisted SQLite value', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, WORKSPACE_SIDEBAR_E2E_DISPLAY_NAME)
    await expectFaPlaywrightE2eHashRoute(appWindow, '/home')
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    const panelWidthPx = await readFaPlaywrightE2eWorkspaceSidebarPanelWidthPx(appWindow)
    const bridgeWidthPx = await readFaPlaywrightE2eProjectSidebarWidthFromBridge(appWindow)

    expect(bridgeWidthPx).toBe(e2eWorkspaceSidebarPersistedWidthPx)
    assertFaPlaywrightE2eWorkspaceSidebarWidthNear(
      panelWidthPx,
      e2eWorkspaceSidebarPersistedWidthPx,
      'restored workspace sidebar panel width'
    )
    assertFaPlaywrightE2eWorkspaceSidebarWidthNear(
      bridgeWidthPx,
      panelWidthPx,
      'restored bridge width vs panel width'
    )
    expect(panelWidthPx).toBeGreaterThan(FA_PROJECT_SIDEBAR_MIN_WIDTH_PX)
  })
})
