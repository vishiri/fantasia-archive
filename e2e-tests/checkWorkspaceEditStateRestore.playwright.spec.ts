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
  projectAppControlBar: 'projectAppControlBar',
  documentNameInput: 'documentWorkspacePage-nameInput',
  documentPreviewTitle: 'documentWorkspacePage-previewTitle',
  splashNew: 'splashPage-btn-new'
} as const

const EDIT_STATE_E2E_FAPROJECT = 'e2e-edit-state-restore.faproject'
const EDIT_STATE_E2E_PROJECT_NAME = 'E2E editState restore project'
const EDIT_STATE_E2E_LABEL_PREVIEW = 'E2E Preview Tab'
const EDIT_STATE_E2E_LABEL_EDIT = 'E2E Edit Tab'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eEditStatePreviewDocumentId = ''
let e2eEditStateEditDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, EDIT_STATE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(EDIT_STATE_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, EDIT_STATE_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedPreviewAndEditOpenedDocumentTabs (
  page: Page
): Promise<{ previewDocumentId: string, editDocumentId: string }> {
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
      tabLabel: string,
      editState: boolean
    ) => {
      return {
        displayNameDraft: tabLabel,
        documentId,
        persistenceState: 'persisted' as const,
        hasUnsavedChanges: false,
        editState,
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

    const documentPreview = await content.createDocument({
      displayName: labels.labelPreview,
      worldId: world.id
    })
    const documentEdit = await content.createDocument({
      displayName: labels.labelEdit,
      worldId: world.id
    })
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: documentEdit.id,
      schemaVersion: 1,
      tabs: [
        buildPersistedTab(documentPreview.id, labels.labelPreview, false),
        buildPersistedTab(documentEdit.id, labels.labelEdit, true)
      ]
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return {
      previewDocumentId: documentPreview.id,
      editDocumentId: documentEdit.id
    }
  }, {
    labelPreview: EDIT_STATE_E2E_LABEL_PREVIEW,
    labelEdit: EDIT_STATE_E2E_LABEL_EDIT
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

async function expectDocumentWorkspaceEditMode (page: Page): Promise<void> {
  await expect(
    page.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
  ).toBeVisible({ timeout: 15_000 })
  await expect(
    page.locator(`[data-test-locator="${selectorList.documentPreviewTitle}"]`)
  ).toHaveCount(0)
}

async function expectDocumentWorkspacePreviewMode (page: Page): Promise<void> {
  await expect(
    page.locator(`[data-test-locator="${selectorList.documentPreviewTitle}"]`)
  ).toBeVisible({ timeout: 15_000 })
  await expect(
    page.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
  ).toHaveCount(0)
}

async function activateOpenedDocumentTab (
  page: Page,
  documentId: string
): Promise<void> {
  await page.locator(
    `[data-test-locator="projectAppControlBar-tab-${documentId}"]`
  ).click()
  await expectFaPlaywrightE2eHashRoute(page, `/home/document/${documentId}`)
}

test.describe.serial('Opened documents E2E — seed dual editState tabs', () => {
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
        tryUnlinkE2eFaprojectFixture(EDIT_STATE_E2E_FAPROJECT)
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

  test('Seed preview + edit tabs and assert modes before cold restart', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await seedPreviewAndEditOpenedDocumentTabs(appWindow)
    e2eEditStatePreviewDocumentId = seeded.previewDocumentId
    e2eEditStateEditDocumentId = seeded.editDocumentId
    expect(e2eEditStatePreviewDocumentId.length).toBeGreaterThan(0)
    expect(e2eEditStateEditDocumentId.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsAndRoute(appWindow, e2eEditStateEditDocumentId)

    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eEditStatePreviewDocumentId}"]`
      )
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eEditStateEditDocumentId}"]`
      )
    ).toBeVisible()

    await expectDocumentWorkspaceEditMode(appWindow)
    await activateOpenedDocumentTab(appWindow, e2eEditStatePreviewDocumentId)
    await expectDocumentWorkspacePreviewMode(appWindow)
    await activateOpenedDocumentTab(appWindow, e2eEditStateEditDocumentId)
    await expectDocumentWorkspaceEditMode(appWindow)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restore dual editState', () => {
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

  test('Cold restart restores preview vs edit per tab', async () => {
    expect(e2eEditStatePreviewDocumentId.length).toBeGreaterThan(0)
    expect(e2eEditStateEditDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, EDIT_STATE_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eEditStatePreviewDocumentId}"]`
      )
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eEditStateEditDocumentId}"]`
      )
    ).toBeVisible()

    await activateOpenedDocumentTab(appWindow, e2eEditStateEditDocumentId)
    await expectDocumentWorkspaceEditMode(appWindow)
    await activateOpenedDocumentTab(appWindow, e2eEditStatePreviewDocumentId)
    await expectDocumentWorkspacePreviewMode(appWindow)
  })
})
