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

const DIRTY_DRAFT_E2E_FAPROJECT = 'e2e-dirty-draft-survive.faproject'
const DIRTY_DRAFT_E2E_PROJECT_NAME = 'E2E dirty draft survive project'
const DIRTY_DRAFT_E2E_SAVED_LABEL = 'E2E Dirty Saved Base'
const DIRTY_DRAFT_E2E_DRAFT_LABEL = 'E2E Dirty Draft Survive'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eDirtyDraftDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, DIRTY_DRAFT_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(DIRTY_DRAFT_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, DIRTY_DRAFT_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedDirtyPersistedOpenedDocumentTab (
  page: Page
): Promise<string> {
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
    const document = await content.createDocument({
      displayName: labels.savedLabel,
      worldId: world.id
    })
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: document.id,
      schemaVersion: 1,
      tabs: [{
        displayNameDraft: labels.draftLabel,
        documentId: document.id,
        persistenceState: 'persisted',
        hasUnsavedChanges: true,
        editState: true,
        savedDisplayName: labels.savedLabel,
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
        tabLabel: labels.draftLabel,
        templateIcon: 'mdi-file-document'
      }]
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return document.id
  }, {
    draftLabel: DIRTY_DRAFT_E2E_DRAFT_LABEL,
    savedLabel: DIRTY_DRAFT_E2E_SAVED_LABEL
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

test.describe.serial('Opened documents E2E — dirty draft survives soft nav', () => {
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
        tryUnlinkE2eFaprojectFixture(DIRTY_DRAFT_E2E_FAPROJECT)
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

  test('Dirty draft tab label survives soft nav to dashboard and back', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    e2eDirtyDraftDocumentId = await seedDirtyPersistedOpenedDocumentTab(appWindow)
    expect(e2eDirtyDraftDocumentId.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsAndRoute(appWindow, e2eDirtyDraftDocumentId)
    const tab = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eDirtyDraftDocumentId}"]`
    )
    await expect(tab).toBeVisible({ timeout: 15_000 })
    await expect(appWindow.getByText(DIRTY_DRAFT_E2E_DRAFT_LABEL, { exact: true })).toHaveCount(1)
    await expect(
      appWindow.locator('[data-test-locator="documentWorkspacePage-nameInput"]')
    ).toHaveValue(DIRTY_DRAFT_E2E_DRAFT_LABEL)

    await softNavigateToProjectDashboard(appWindow)
    await expect(tab).toBeVisible()
    await expect(appWindow.getByText(DIRTY_DRAFT_E2E_DRAFT_LABEL, { exact: true })).toHaveCount(1)

    await tab.click()
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eDirtyDraftDocumentId}`)
    await expect(
      appWindow.locator('[data-test-locator="documentWorkspacePage-nameInput"]')
    ).toHaveValue(DIRTY_DRAFT_E2E_DRAFT_LABEL)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — dirty draft survives cold restart', () => {
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

  test('Cold restart restores dirty draft label and edit field', async () => {
    expect(e2eDirtyDraftDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, DIRTY_DRAFT_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eDirtyDraftDocumentId}"]`
      )
    ).toBeVisible({ timeout: 15_000 })
    await expect(appWindow.getByText(DIRTY_DRAFT_E2E_DRAFT_LABEL, { exact: true })).toHaveCount(1)
    await expectFaPlaywrightE2eHashRoute(
      appWindow,
      `/home/document/${e2eDirtyDraftDocumentId}`
    )
    await expect(
      appWindow.locator('[data-test-locator="documentWorkspacePage-nameInput"]')
    ).toHaveValue(DIRTY_DRAFT_E2E_DRAFT_LABEL, { timeout: 15_000 })
  })
})
