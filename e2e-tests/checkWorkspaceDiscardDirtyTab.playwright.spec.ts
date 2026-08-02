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
  discardDialog: 'dialogDiscardOpenedDocumentTab',
  discardConfirm: 'dialogDiscardOpenedDocumentTab-discard',
  nameInput: 'dialogNewProject-input-name',
  projectAppControlBar: 'projectAppControlBar',
  splashNew: 'splashPage-btn-new'
} as const

const DISCARD_DIRTY_E2E_FAPROJECT = 'e2e-discard-dirty-tab.faproject'
const DISCARD_DIRTY_E2E_PROJECT_NAME = 'E2E discard dirty tab project'
const DISCARD_DIRTY_E2E_SAVED_LABEL = 'E2E Dirty Saved Name'
const DISCARD_DIRTY_E2E_DRAFT_LABEL = 'E2E Dirty Draft Name'
const DISCARD_DIRTY_E2E_KEPT_LABEL = 'E2E Kept Clean Tab'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eDiscardDirtyDocumentId = ''
let e2eDiscardKeptDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, DISCARD_DIRTY_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(DISCARD_DIRTY_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, DISCARD_DIRTY_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedDirtyAndCleanOpenedDocumentTabs (
  page: Page
): Promise<{ dirtyDocumentId: string, keptDocumentId: string }> {
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

    const buildPersistedTab = (
      documentId: string,
      savedLabel: string,
      options: {
        displayNameDraft: string
        hasUnsavedChanges: boolean
        tabLabel: string
      }
    ) => {
      return {
        displayNameDraft: options.displayNameDraft,
        documentId,
        persistenceState: 'persisted' as const,
        hasUnsavedChanges: options.hasUnsavedChanges,
        editState: false,
        savedDisplayName: savedLabel,
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
        tabLabel: options.tabLabel,
        templateIcon: 'mdi-file-document'
      }
    }

    const dirtyDocument = await content.createDocument({
      displayName: labels.savedLabel,
      worldId: world.id
    })
    const keptDocument = await content.createDocument({
      displayName: labels.keptLabel,
      worldId: world.id
    })
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: dirtyDocument.id,
      schemaVersion: 1,
      tabs: [
        buildPersistedTab(dirtyDocument.id, labels.savedLabel, {
          displayNameDraft: labels.draftLabel,
          hasUnsavedChanges: true,
          tabLabel: labels.draftLabel
        }),
        buildPersistedTab(keptDocument.id, labels.keptLabel, {
          displayNameDraft: labels.keptLabel,
          hasUnsavedChanges: false,
          tabLabel: labels.keptLabel
        })
      ]
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return {
      dirtyDocumentId: dirtyDocument.id,
      keptDocumentId: keptDocument.id
    }
  }, {
    draftLabel: DISCARD_DIRTY_E2E_DRAFT_LABEL,
    keptLabel: DISCARD_DIRTY_E2E_KEPT_LABEL,
    savedLabel: DISCARD_DIRTY_E2E_SAVED_LABEL
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

test.describe.serial('Opened documents E2E — discard dirty tab before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(DISCARD_DIRTY_E2E_FAPROJECT)
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

  test('Discard dirty tab via close dialog; keep clean sibling', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await seedDirtyAndCleanOpenedDocumentTabs(appWindow)
    e2eDiscardDirtyDocumentId = seeded.dirtyDocumentId
    e2eDiscardKeptDocumentId = seeded.keptDocumentId
    expect(e2eDiscardDirtyDocumentId.length).toBeGreaterThan(0)
    expect(e2eDiscardKeptDocumentId.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsAndRoute(appWindow, e2eDiscardDirtyDocumentId)

    const dirtyTab = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eDiscardDirtyDocumentId}"]`
    )
    const keptTab = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eDiscardKeptDocumentId}"]`
    )
    await expect(dirtyTab).toBeVisible({ timeout: 15_000 })
    await expect(keptTab).toBeVisible()
    await expect(appWindow.getByText(DISCARD_DIRTY_E2E_DRAFT_LABEL, { exact: true })).toHaveCount(1)

    await appWindow.locator(
      `[data-test-locator="projectAppControlBar-tabClose-${e2eDiscardDirtyDocumentId}"]`
    ).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.discardDialog}"]`)
    ).toBeVisible({ timeout: 10_000 })
    await appWindow.locator(
      `[data-test-locator="${selectorList.discardConfirm}"]`
    ).click()

    await expect(dirtyTab).toHaveCount(0, { timeout: 15_000 })
    await expect(keptTab).toBeVisible()
    await expect(appWindow.getByText(DISCARD_DIRTY_E2E_DRAFT_LABEL, { exact: true })).toHaveCount(0)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart after discard dirty tab', () => {
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

  test('Discarded dirty tab and draft stay gone after cold restart', async () => {
    expect(e2eDiscardDirtyDocumentId.length).toBeGreaterThan(0)
    expect(e2eDiscardKeptDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, DISCARD_DIRTY_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eDiscardKeptDocumentId}"]`
      )
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eDiscardDirtyDocumentId}"]`
      )
    ).toHaveCount(0)
    await expect(appWindow.getByText(DISCARD_DIRTY_E2E_KEPT_LABEL, { exact: true })).toHaveCount(1)
    await expect(appWindow.getByText(DISCARD_DIRTY_E2E_DRAFT_LABEL, { exact: true })).toHaveCount(0)
  })
})
