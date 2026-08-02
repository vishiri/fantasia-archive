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
  nameInput: 'dialogNewProject-input-name',
  projectAppControlBar: 'projectAppControlBar',
  splashNew: 'splashPage-btn-new'
} as const

const DASHBOARD_TABS_E2E_FAPROJECT = 'e2e-dashboard-tabs-remain.faproject'
const DASHBOARD_TABS_E2E_PROJECT_NAME = 'E2E dashboard tabs remain project'
const DASHBOARD_TABS_E2E_LABEL_A = 'E2E Dashboard Tab A'
const DASHBOARD_TABS_E2E_LABEL_B = 'E2E Dashboard Tab B'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eDashboardTabsDocumentIdA = ''
let e2eDashboardTabsDocumentIdB = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, DASHBOARD_TABS_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(DASHBOARD_TABS_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, DASHBOARD_TABS_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedTwoPersistedOpenedDocumentTabs (
  page: Page
): Promise<{ documentIdA: string, documentIdB: string }> {
  return page.evaluate(async (labels) => {
    const content = window.faContentBridgeAPIs?.projectContent
    const management = window.faContentBridgeAPIs?.projectManagement
    if (content === undefined || management === undefined) {
      throw new Error('Project content or management bridge unavailable')
    }
    const worlds = await content.listWorlds()
    const world = worlds.items[0]
    if (world === undefined) {
      throw new Error('No default world in E2E project')
    }

    const buildPersistedTab = (documentId: string, tabLabel: string) => {
      return {
        displayNameDraft: tabLabel,
        documentId,
        persistenceState: 'persisted' as const,
        hasUnsavedChanges: false,
        editState: false,
        savedDisplayName: tabLabel,
        documentTextColorDraft: '',
        savedDocumentTextColor: '',
        documentBackgroundColorDraft: '',
        savedDocumentBackgroundColor: '',
        isCategoryDraft: false,
        savedIsCategory: false,
        isFinishedDraft: false,
        isMinorDraft: false,
        isDeadDraft: false,
        savedIsFinished: false,
        savedIsMinor: false,
        savedIsDead: false,
        parentDocumentIdDraft: '',
        savedParentDocumentId: '',
        treeOrderNumberDraft: '',
        savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
        extraClassesDraft: '',
        savedExtraClasses: '',
        tabLabel,
        templateIcon: 'mdi-file-document'
      }
    }

    const documentA = await content.createDocument({
      displayName: labels.labelA,
      worldId: world.id
    })
    const documentB = await content.createDocument({
      displayName: labels.labelB,
      worldId: world.id
    })
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: documentA.id,
      schemaVersion: 1,
      tabs: [
        buildPersistedTab(documentA.id, labels.labelA),
        buildPersistedTab(documentB.id, labels.labelB)
      ]
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return {
      documentIdA: documentA.id,
      documentIdB: documentB.id
    }
  }, {
    labelA: DASHBOARD_TABS_E2E_LABEL_A,
    labelB: DASHBOARD_TABS_E2E_LABEL_B
  })
}

async function hydrateOpenedDocumentsAndRoute (
  page: Page,
  documentId: string
): Promise<void> {
  await page.evaluate(async (nextDocumentId) => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                hydrateFromProjectDatabase?: () => Promise<void>
              }>
            }
            $router: {
              replace: (location: { path: string }) => Promise<void>
            }
          }
        }
      }
    }
    const globalProperties = root?.__vue_app__?.config.globalProperties
    const router = globalProperties?.$router
    const openedDocumentsStore = globalProperties?.$pinia?._s?.get('S_FaOpenedDocuments')
    if (router === undefined) {
      throw new Error('Vue router missing in E2E app')
    }
    if (typeof openedDocumentsStore?.hydrateFromProjectDatabase !== 'function') {
      throw new Error('S_FaOpenedDocuments.hydrateFromProjectDatabase missing in E2E app')
    }
    await openedDocumentsStore.hydrateFromProjectDatabase()
    await router.replace({ path: `/home/document/${nextDocumentId}` })
  }, documentId)
}

async function softNavigateToProjectDashboard (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`).click()
  await page.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_SHOW_PROJECT_DASHBOARD)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
}

async function readOpenedTabDocumentIds (page: Page): Promise<string[]> {
  return page.locator('[data-test-locator^="projectAppControlBar-tab-"]').evaluateAll((nodes) => {
    return nodes.map((node) => {
      const locator = node.getAttribute('data-test-locator') ?? ''
      return locator.replace('projectAppControlBar-tab-', '')
    })
  })
}

test.describe.serial('Opened documents E2E — dashboard soft nav keeps tab strip', () => {
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
        tryUnlinkE2eFaprojectFixture(DASHBOARD_TABS_E2E_FAPROJECT)
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

  test('Show project dashboard keeps both tabs visible on /home', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await seedTwoPersistedOpenedDocumentTabs(appWindow)
    e2eDashboardTabsDocumentIdA = seeded.documentIdA
    e2eDashboardTabsDocumentIdB = seeded.documentIdB
    expect(e2eDashboardTabsDocumentIdA.length).toBeGreaterThan(0)
    expect(e2eDashboardTabsDocumentIdB.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsAndRoute(appWindow, e2eDashboardTabsDocumentIdA)
    const tabA = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eDashboardTabsDocumentIdA}"]`
    )
    const tabB = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eDashboardTabsDocumentIdB}"]`
    )
    await expect(tabA).toBeVisible({ timeout: 15_000 })
    await expect(tabB).toBeVisible()

    await softNavigateToProjectDashboard(appWindow)
    await expect(tabA).toBeVisible()
    await expect(tabB).toBeVisible()
    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }, { timeout: 15_000 }).toEqual([
      e2eDashboardTabsDocumentIdA,
      e2eDashboardTabsDocumentIdB
    ])
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart restores dashboard tab strip', () => {
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

  test('Cold restart restores both tabs in original order', async () => {
    expect(e2eDashboardTabsDocumentIdA.length).toBeGreaterThan(0)
    expect(e2eDashboardTabsDocumentIdB.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, DASHBOARD_TABS_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toBeVisible()
    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }, { timeout: 15_000 }).toEqual([
      e2eDashboardTabsDocumentIdA,
      e2eDashboardTabsDocumentIdB
    ])
    await expect(appWindow.getByText(DASHBOARD_TABS_E2E_LABEL_A, { exact: true })).toHaveCount(1)
    await expect(appWindow.getByText(DASHBOARD_TABS_E2E_LABEL_B, { exact: true })).toHaveCount(1)
  })
})
