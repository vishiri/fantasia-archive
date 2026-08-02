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
  e2eGetDocumentById,
  e2eHierarchyTreeSelectorList,
  e2eOpenHierarchyNodeContextMenu,
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

const TREE_DELETE_E2E_FAPROJECT = 'e2e-tree-delete.faproject'
const TREE_DELETE_E2E_PROJECT_NAME = 'E2E tree delete project'
const TREE_DELETE_E2E_LABEL = 'E2E Tree Delete Target'
const TREE_DELETE_E2E_SURVIVOR_LABEL = 'E2E Tree Delete Survivor'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eTreeDeleteDocumentId = ''
let e2eTreeDeleteSurvivorDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TREE_DELETE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TREE_DELETE_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TREE_DELETE_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function confirmDeleteDocumentFromTreeContextMenu (page: Page, documentId: string): Promise<void> {
  await e2eOpenHierarchyNodeContextMenu(page, documentId)
  await page.locator(
    `[data-test-locator="${e2eHierarchyTreeSelectorList.contextDeleteDocument}"]`
  ).click()
  await expect(
    page.locator(`[data-test-locator="${e2eHierarchyTreeSelectorList.deleteDialog}"]`)
  ).toBeVisible({ timeout: 15_000 })
  await page.locator(
    `[data-test-locator="${e2eHierarchyTreeSelectorList.deleteDialogConfirm}"]`
  ).click()
  await expect(
    page.locator(`[data-test-locator="${e2eHierarchyTreeSelectorList.deleteDialog}"]`)
  ).toHaveCount(0, { timeout: 15_000 })
}

test.describe.serial('Opened documents E2E — delete document from hierarchy tree', () => {
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
        tryUnlinkE2eFaprojectFixture(TREE_DELETE_E2E_FAPROJECT)
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

  test('Delete from tree while tab open closes tab and removes SQLite row', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await e2eSeedHierarchyPlacementWithDocuments(appWindow, {
      documents: [
        {
          displayName: TREE_DELETE_E2E_LABEL,
          sortOrder: 0
        },
        {
          displayName: TREE_DELETE_E2E_SURVIVOR_LABEL,
          sortOrder: 1
        }
      ],
      templateDisplayName: 'E2E Tree Delete Template'
    })
    e2eTreeDeleteDocumentId = seeded.documents[0]?.id ?? ''
    e2eTreeDeleteSurvivorDocumentId = seeded.documents[1]?.id ?? ''
    expect(e2eTreeDeleteDocumentId.length).toBeGreaterThan(0)
    expect(e2eTreeDeleteSurvivorDocumentId.length).toBeGreaterThan(0)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await e2eClickHierarchyDocumentLabel(appWindow, TREE_DELETE_E2E_LABEL)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeDeleteDocumentId}`)
    await e2eClickHierarchyDocumentLabel(appWindow, TREE_DELETE_E2E_SURVIVOR_LABEL)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeDeleteSurvivorDocumentId}`)
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eTreeDeleteDocumentId}"]`)
    ).toBeVisible()

    await confirmDeleteDocumentFromTreeContextMenu(appWindow, e2eTreeDeleteDocumentId)

    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeDeleteSurvivorDocumentId}`)
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eTreeDeleteDocumentId}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.getByText(TREE_DELETE_E2E_LABEL, { exact: true })
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eTreeDeleteSurvivorDocumentId}"]`)
    ).toBeVisible()

    await expect.poll(async () => {
      try {
        await e2eGetDocumentById(appWindow, e2eTreeDeleteDocumentId)
        return 'found'
      } catch {
        return 'missing'
      }
    }).toBe('missing')

    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart after tree delete', () => {
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

  test('Cold restart keeps deleted document absent from tree and SQLite', async () => {
    expect(e2eTreeDeleteDocumentId.length).toBeGreaterThan(0)
    expect(e2eTreeDeleteSurvivorDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, TREE_DELETE_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await expect(
      appWindow.locator(
        `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
      ).filter({ hasText: TREE_DELETE_E2E_SURVIVOR_LABEL })
    ).toHaveCount(1)
    await expect(
      appWindow.locator(
        `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
      ).filter({ hasText: TREE_DELETE_E2E_LABEL })
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eTreeDeleteDocumentId}"]`)
    ).toHaveCount(0)
    await expect.poll(async () => {
      try {
        await e2eGetDocumentById(appWindow, e2eTreeDeleteDocumentId)
        return 'found'
      } catch {
        return 'missing'
      }
    }).toBe('missing')
  })
})
