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
  projectDocumentControlBar: 'projectDocumentControlBar',
  splashNew: 'splashPage-btn-new'
} as const

const OPENED_DOCUMENTS_E2E_FAPROJECT = 'e2e-opened-documents.faproject'

const OPENED_DOCUMENTS_E2E_DISPLAY_NAME = 'E2E opened documents project'

const OPENED_DOCUMENTS_E2E_TAB_LABEL = 'E2E Tab Document'

let e2eOpenedDocumentsPersistedDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, OPENED_DOCUMENTS_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(OPENED_DOCUMENTS_E2E_DISPLAY_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, OPENED_DOCUMENTS_E2E_DISPLAY_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedOpenedDocumentsSnapshotForFirstWorldDocument (
  page: Page
): Promise<string> {
  const documentId = await page.evaluate(async (tabLabel) => {
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
    const document = await content.createDocument({
      displayName: tabLabel,
      worldId: world.id
    })
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: document.id,
      schemaVersion: 1,
      tabs: [
        {
          displayNameDraft: tabLabel,
          documentId: document.id,
          persistenceState: 'persisted',
          hasUnsavedChanges: false,
          editState: false,
          savedDisplayName: tabLabel,
          tabLabel,
          templateIcon: 'mdi-file-document'
        }
      ]
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return document.id
  }, OPENED_DOCUMENTS_E2E_TAB_LABEL)
  return documentId
}

test.describe.serial('Opened documents E2E — persist snapshot and restore on reopen', () => {
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
        tryUnlinkE2eFaprojectFixture(OPENED_DOCUMENTS_E2E_FAPROJECT)
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
   * Creates a project, seeds opened_documents in SQLite, and records the document id for cold restart.
   */
  test('Seed opened documents snapshot in the active project database', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    e2eOpenedDocumentsPersistedDocumentId = await seedOpenedDocumentsSnapshotForFirstWorldDocument(
      appWindow
    )
    expect(e2eOpenedDocumentsPersistedDocumentId.length).toBeGreaterThan(0)
  })
})

test.describe.serial('Opened documents E2E — cold restart restores workspace tabs', () => {
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
   * Reopens the persisted project and hydrates document tabs from opened_documents.
   */
  test('Restore opened document tabs after cold restart', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, OPENED_DOCUMENTS_E2E_DISPLAY_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    const tabLocator = `[data-test-locator="projectDocumentControlBar-tab-${e2eOpenedDocumentsPersistedDocumentId}"]`
    await expect(appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBar}"]`)).toBeVisible()
    await expect(appWindow.locator(tabLocator)).toBeVisible()
    await expect(appWindow.getByText(OPENED_DOCUMENTS_E2E_TAB_LABEL, { exact: true })).toHaveCount(1)
    await expectFaPlaywrightE2eHashRoute(
      appWindow,
      `/home/document/${e2eOpenedDocumentsPersistedDocumentId}`
    )
  })
})
