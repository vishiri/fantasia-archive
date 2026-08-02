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
  splashNew: 'splashPage-btn-new'
} as const

const EXTERNAL_DELETE_E2E_FAPROJECT = 'e2e-external-delete-stale-tab.faproject'
const EXTERNAL_DELETE_E2E_PROJECT_NAME = 'E2E external delete stale tab project'
const EXTERNAL_DELETE_E2E_TAB_A = 'E2E Stale Tab A'
const EXTERNAL_DELETE_E2E_TAB_B = 'E2E Stale Tab B'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eExternalDeleteStaleDocumentId = ''
let e2eExternalDeleteSurvivorDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, EXTERNAL_DELETE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(EXTERNAL_DELETE_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, EXTERNAL_DELETE_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedTwoPersistedOpenedDocumentTabs (
  page: Page
): Promise<{ staleDocumentId: string, survivorDocumentId: string }> {
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
      displayName: labels.tabA,
      worldId: world.id
    })
    const documentB = await content.createDocument({
      displayName: labels.tabB,
      worldId: world.id
    })
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: documentA.id,
      schemaVersion: 2,
      tabs: [
        buildPersistedTab(documentA.id, labels.tabA),
        buildPersistedTab(documentB.id, labels.tabB)
      ]
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return {
      staleDocumentId: documentA.id,
      survivorDocumentId: documentB.id
    }
  }, {
    tabA: EXTERNAL_DELETE_E2E_TAB_A,
    tabB: EXTERNAL_DELETE_E2E_TAB_B
  })
}

async function deleteDocumentViaBridge (
  page: Page,
  documentId: string
): Promise<void> {
  await page.evaluate(async (id) => {
    const content = window.faContentBridgeAPIs?.projectContent
    if (content === undefined) {
      throw new Error('Project content bridge unavailable')
    }
    await content.deleteDocument(id)
  }, documentId)
}

async function hydrateOpenedDocumentsFromDatabase (
  page: Page
): Promise<void> {
  await page.evaluate(async () => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                hydrateFromProjectDatabase?: () => Promise<void>
                activeDocumentId?: string | null
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
    const activeId = globalProperties?.$pinia?._s?.get('S_FaOpenedDocuments')?.activeDocumentId
    if (activeId !== null && activeId !== undefined) {
      await router.replace({ path: `/home/document/${activeId}` })
    }
  })
}

test.describe.serial('Opened documents E2E — external delete drops stale tab before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(EXTERNAL_DELETE_E2E_FAPROJECT)
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

  test('External deleteDocument removes stale tab on hydrate while survivor remains', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await seedTwoPersistedOpenedDocumentTabs(appWindow)
    e2eExternalDeleteStaleDocumentId = seeded.staleDocumentId
    e2eExternalDeleteSurvivorDocumentId = seeded.survivorDocumentId
    expect(e2eExternalDeleteStaleDocumentId.length).toBeGreaterThan(0)
    expect(e2eExternalDeleteSurvivorDocumentId.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsFromDatabase(appWindow)

    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eExternalDeleteStaleDocumentId}"]`
      )
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eExternalDeleteSurvivorDocumentId}"]`
      )
    ).toBeVisible()

    await deleteDocumentViaBridge(appWindow, e2eExternalDeleteStaleDocumentId)
    await hydrateOpenedDocumentsFromDatabase(appWindow)

    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eExternalDeleteStaleDocumentId}"]`
      )
    ).toHaveCount(0)
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eExternalDeleteSurvivorDocumentId}"]`
      )
    ).toBeVisible()
    await expectFaPlaywrightE2eHashRoute(
      appWindow,
      `/home/document/${e2eExternalDeleteSurvivorDocumentId}`
    )

    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart drops externally deleted tab', () => {
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

  test('Cold restart keeps only survivor tab after external delete', async () => {
    expect(e2eExternalDeleteStaleDocumentId.length).toBeGreaterThan(0)
    expect(e2eExternalDeleteSurvivorDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, EXTERNAL_DELETE_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eExternalDeleteStaleDocumentId}"]`
      )
    ).toHaveCount(0)
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eExternalDeleteSurvivorDocumentId}"]`
      )
    ).toBeVisible({ timeout: 15_000 })
    await expectFaPlaywrightE2eHashRoute(
      appWindow,
      `/home/document/${e2eExternalDeleteSurvivorDocumentId}`
    )
  })
})
