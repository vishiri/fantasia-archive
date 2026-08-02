import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import {
  e2eExpandWorldAndPlacementNodes,
  e2eGetDocumentById,
  e2eHierarchyTreeSelectorList,
  e2eHydrateOpenedDocumentsAndRoute,
  e2eReadPlacementRootSiblingDisplayNames,
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
  documentNameInput: 'documentWorkspacePage-nameInput',
  hierarchyTreeHost: 'projectHierarchyTree-host',
  nameInput: 'dialogNewProject-input-name',
  saveDocumentButton: 'projectAppControlBar-saveDocumentButton',
  splashNew: 'splashPage-btn-new'
} as const

const TREE_CREATE_E2E_FAPROJECT = 'e2e-tree-create-save.faproject'
const TREE_CREATE_E2E_PROJECT_NAME = 'E2E tree create save project'
const TREE_CREATE_E2E_SAVED_LABEL = 'E2E Tree UI Created'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eTreeCreateSavedDocumentId = ''
let e2eTreeCreatePlacementId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TREE_CREATE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TREE_CREATE_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TREE_CREATE_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

test.describe.serial('Opened documents E2E — create document from tree UI', () => {
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
        tryUnlinkE2eFaprojectFixture(TREE_CREATE_E2E_FAPROJECT)
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

  test('Add-new tree row save promotes document into hierarchy SQLite', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await e2eSeedHierarchyPlacementWithDocuments(appWindow, {
      documents: [],
      templateDisplayName: 'E2E Tree Create Template',
      templateSingularTitle: 'Character'
    })
    e2eTreeCreatePlacementId = seeded.placementId
    expect(e2eTreeCreatePlacementId.length).toBeGreaterThan(0)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await e2eExpandWorldAndPlacementNodes(appWindow)

    await appWindow.locator(
      '[data-test-locator="projectHierarchyTree-node-addNewDocument-label"]'
    ).filter({ hasText: 'Add new character' }).click({ force: true })

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
    await expect(nameInput).toBeVisible({ timeout: 15_000 })
    await nameInput.fill(TREE_CREATE_E2E_SAVED_LABEL)
    await appWindow.locator(`[data-test-locator="${selectorList.saveDocumentButton}"]`).click()
    await expect(
      appWindow.locator('[data-test-locator="documentWorkspacePage-previewTitle"]')
    ).toHaveText(TREE_CREATE_E2E_SAVED_LABEL, { timeout: 15_000 })

    e2eTreeCreateSavedDocumentId = await appWindow.evaluate(() => {
      const root = document.querySelector('#q-app') as HTMLElement & {
        __vue_app__?: {
          config: {
            globalProperties: {
              $pinia?: {
                _s?: Map<string, {
                  activeDocumentId?: string | null
                }>
              }
            }
          }
        }
      }
      return root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaOpenedDocuments')?.activeDocumentId ?? ''
    })
    expect(e2eTreeCreateSavedDocumentId.length).toBeGreaterThan(0)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await expect(
      appWindow.locator(
        `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
      ).filter({ hasText: TREE_CREATE_E2E_SAVED_LABEL })
    ).toHaveCount(1)

    const siblingNames = await e2eReadPlacementRootSiblingDisplayNames(
      appWindow,
      e2eTreeCreatePlacementId
    )
    expect(siblingNames).toContain(TREE_CREATE_E2E_SAVED_LABEL)
    const savedDocument = await e2eGetDocumentById(appWindow, e2eTreeCreateSavedDocumentId)
    expect(savedDocument.displayName).toBe(TREE_CREATE_E2E_SAVED_LABEL)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps tree UI created document', () => {
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

  test('Cold restart restores tree UI created document row and tab route', async () => {
    expect(e2eTreeCreateSavedDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, TREE_CREATE_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await expect(
      appWindow.locator(
        `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
      ).filter({ hasText: TREE_CREATE_E2E_SAVED_LABEL })
    ).toHaveCount(1)
    await e2eHydrateOpenedDocumentsAndRoute(appWindow, e2eTreeCreateSavedDocumentId)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeCreateSavedDocumentId}`)
    const savedDocument = await e2eGetDocumentById(appWindow, e2eTreeCreateSavedDocumentId)
    expect(savedDocument.displayName).toBe(TREE_CREATE_E2E_SAVED_LABEL)
  })
})
