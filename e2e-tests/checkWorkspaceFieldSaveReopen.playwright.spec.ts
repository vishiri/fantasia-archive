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
import { FA_PLAYWRIGHT_PRESS_DEFAULT_SAVE_DOCUMENT } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
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
  isFinishedToggle: 'documentWorkspacePage-isFinishedToggle',
  orderNumberInput: 'documentWorkspacePage-orderNumberInput',
  nameInput: 'dialogNewProject-input-name',
  projectAppControlBar: 'projectAppControlBar',
  splashNew: 'splashPage-btn-new'
} as const

const FIELD_SAVE_E2E_FAPROJECT = 'e2e-field-save-reopen.faproject'
const FIELD_SAVE_E2E_PROJECT_NAME = 'E2E field save reopen project'
const FIELD_SAVE_E2E_ORIGINAL_LABEL = 'E2E Field Save Original'
const FIELD_SAVE_E2E_SAVED_LABEL = 'E2E Field Save Renamed'
const FIELD_SAVE_E2E_ORDER_NUMBER = '42'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eFieldSaveDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, FIELD_SAVE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(FIELD_SAVE_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, FIELD_SAVE_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedEditablePersistedDocumentTab (
  page: Page
): Promise<string> {
  return page.evaluate(async (tabLabel) => {
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
      schemaVersion: 2,
      tabs: [{
        displayNameDraft: tabLabel,
        documentId: document.id,
        persistenceState: 'persisted',
        hasUnsavedChanges: false,
        editState: true,
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
        tagsDraft: [],
        savedTags: [],
        tabLabel,
        templateIcon: 'mdi-file-document'
      }]
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return document.id
  }, FIELD_SAVE_E2E_ORIGINAL_LABEL)
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

test.describe.serial('Opened documents E2E — field save before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(FIELD_SAVE_E2E_FAPROJECT)
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

  test('Name order number and finished flag save from edit mode', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    e2eFieldSaveDocumentId = await seedEditablePersistedDocumentTab(appWindow)
    expect(e2eFieldSaveDocumentId.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsAndRoute(appWindow, e2eFieldSaveDocumentId)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`).click()

    await appWindow
      .locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
      .fill(FIELD_SAVE_E2E_SAVED_LABEL)
    await appWindow
      .locator(`[data-test-locator="${selectorList.orderNumberInput}"]`)
      .fill(FIELD_SAVE_E2E_ORDER_NUMBER)
    await appWindow
      .locator(`[data-test-locator="${selectorList.isFinishedToggle}-toggle"]`)
      .click()
    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_SAVE_DOCUMENT)

    const tab = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eFieldSaveDocumentId}"]`
    )
    await expect(tab).toContainText(FIELD_SAVE_E2E_SAVED_LABEL)
    await expect(tab.locator('.projectAppControlBarTabs__finishedMarker')).toHaveText('✓')

    await expect.poll(async () => {
      return await appWindow.evaluate(async (documentId) => {
        const content = window.faContentBridgeAPIs?.projectContent
        if (content === undefined) {
          throw new Error('Project content bridge unavailable')
        }
        const document = await content.getDocumentById(documentId)
        return {
          displayName: document.displayName,
          isFinished: document.isFinished,
          treeOrderNumber: document.treeOrderNumber
        }
      }, e2eFieldSaveDocumentId)
    }).toEqual({
      displayName: FIELD_SAVE_E2E_SAVED_LABEL,
      isFinished: true,
      treeOrderNumber: Number(FIELD_SAVE_E2E_ORDER_NUMBER)
    })

    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart restores saved fields', () => {
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

  test('Cold restart matches saved SQLite fields and tab label', async () => {
    expect(e2eFieldSaveDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, FIELD_SAVE_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    const tab = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eFieldSaveDocumentId}"]`
    )
    await expect(tab).toBeVisible({ timeout: 15_000 })
    await expect(tab).toContainText(FIELD_SAVE_E2E_SAVED_LABEL)
    await expect(tab.locator('.projectAppControlBarTabs__finishedMarker')).toHaveText('✓')

    await expect.poll(async () => {
      return await appWindow.evaluate(async (documentId) => {
        const content = window.faContentBridgeAPIs?.projectContent
        if (content === undefined) {
          throw new Error('Project content bridge unavailable')
        }
        const document = await content.getDocumentById(documentId)
        return document.displayName
      }, e2eFieldSaveDocumentId)
    }).toBe(FIELD_SAVE_E2E_SAVED_LABEL)
  })
})
