import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import {
  e2eClickHierarchyDocumentLabel,
} from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeLabelHelpers'
import {
  e2eExpandWorldAndPlacementNodes,
  e2eReadOpenedTabDocumentIds,
  e2eRefreshHierarchyTreeLayout,
  e2eSeedHierarchyPlacementWithDocuments
} from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeHelpers'
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
import { FA_PLAYWRIGHT_PRESS_DEFAULT_SHOW_PROJECT_DASHBOARD } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
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
  splashNew: 'splashPage-btn-new'
} as const

const TREE_OPEN_TABS_E2E_FAPROJECT = 'e2e-tree-open-tabs.faproject'
const TREE_OPEN_TABS_E2E_PROJECT_NAME = 'E2E tree open tabs project'
const TREE_OPEN_TABS_E2E_LABEL_A = 'E2E Tree Open Alpha'
const TREE_OPEN_TABS_E2E_LABEL_B = 'E2E Tree Open Bravo'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eTreeOpenTabIdA = ''
let e2eTreeOpenTabIdB = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TREE_OPEN_TABS_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TREE_OPEN_TABS_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TREE_OPEN_TABS_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function softNavigateToProjectDashboard (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`).click()
  await page.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_SHOW_PROJECT_DASHBOARD)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
}

test.describe.serial('Opened documents E2E — tree open tab order and middle-click', () => {
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
        tryUnlinkE2eFaprojectFixture(TREE_OPEN_TABS_E2E_FAPROJECT)
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

  test('Left-click tree open preserves tab order with active route on second document', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await e2eSeedHierarchyPlacementWithDocuments(appWindow, {
      documents: [
        {
          displayName: TREE_OPEN_TABS_E2E_LABEL_A,
          sortOrder: 0
        },
        {
          displayName: TREE_OPEN_TABS_E2E_LABEL_B,
          sortOrder: 1
        }
      ],
      templateDisplayName: 'E2E Tree Open Template'
    })
    e2eTreeOpenTabIdA = seeded.documents[0]?.id ?? ''
    e2eTreeOpenTabIdB = seeded.documents[1]?.id ?? ''
    expect(e2eTreeOpenTabIdA.length).toBeGreaterThan(0)
    expect(e2eTreeOpenTabIdB.length).toBeGreaterThan(0)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await e2eExpandWorldAndPlacementNodes(appWindow)

    await e2eClickHierarchyDocumentLabel(appWindow, TREE_OPEN_TABS_E2E_LABEL_A)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeOpenTabIdA}`)
    await e2eClickHierarchyDocumentLabel(appWindow, TREE_OPEN_TABS_E2E_LABEL_B)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeOpenTabIdB}`)

    await expect.poll(async () => {
      return e2eReadOpenedTabDocumentIds(appWindow)
    }, { timeout: 15_000 }).toEqual([
      e2eTreeOpenTabIdA,
      e2eTreeOpenTabIdB
    ])
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })

  test('Middle-click tree open keeps both tabs after focusing the new document', async () => {
    expect(e2eTreeOpenTabIdA.length).toBeGreaterThan(0)
    expect(e2eTreeOpenTabIdB.length).toBeGreaterThan(0)

    await e2eClickHierarchyDocumentLabel(appWindow, TREE_OPEN_TABS_E2E_LABEL_A)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeOpenTabIdA}`)
    await e2eClickHierarchyDocumentLabel(appWindow, TREE_OPEN_TABS_E2E_LABEL_B)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeOpenTabIdB}`)

    await e2eClickHierarchyDocumentLabel(appWindow, TREE_OPEN_TABS_E2E_LABEL_A)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeOpenTabIdA}`)
    await e2eClickHierarchyDocumentLabel(appWindow, TREE_OPEN_TABS_E2E_LABEL_B, 'middle')
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeOpenTabIdB}`)
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eTreeOpenTabIdA}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eTreeOpenTabIdB}"]`)
    ).toBeVisible()
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })

  test('Overview tree open then dashboard keeps opened_documents snapshot intact', async () => {
    expect(e2eTreeOpenTabIdA.length).toBeGreaterThan(0)

    await softNavigateToProjectDashboard(appWindow)
    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await e2eClickHierarchyDocumentLabel(appWindow, TREE_OPEN_TABS_E2E_LABEL_A)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeOpenTabIdA}`)

    await softNavigateToProjectDashboard(appWindow)
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eTreeOpenTabIdA}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eTreeOpenTabIdB}"]`)
    ).toBeVisible()
    await expect.poll(async () => {
      return e2eReadOpenedTabDocumentIds(appWindow)
    }).toEqual([
      e2eTreeOpenTabIdA,
      e2eTreeOpenTabIdB
    ])
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart restores tree-opened tabs', () => {
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

  test('Cold restart restores tab order active route and dashboard-opened snapshot', async () => {
    expect(e2eTreeOpenTabIdA.length).toBeGreaterThan(0)
    expect(e2eTreeOpenTabIdB.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, TREE_OPEN_TABS_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect.poll(async () => {
      return e2eReadOpenedTabDocumentIds(appWindow)
    }, { timeout: 15_000 }).toEqual([
      e2eTreeOpenTabIdA,
      e2eTreeOpenTabIdB
    ])
    await expectFaPlaywrightE2eHashRoute(appWindow, '/home')
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eTreeOpenTabIdA}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eTreeOpenTabIdB}"]`)
    ).toBeVisible()
    await appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eTreeOpenTabIdB}"]`
    ).click()
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeOpenTabIdB}`)
  })
})
