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

const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

const selectorList = {
  createBtn: 'dialogNewProject-button-create',
  documentNameInput: 'documentWorkspacePage-nameInput',
  nameInput: 'dialogNewProject-input-name',
  projectAppControlBar: 'projectAppControlBar',
  saveDocumentButton: 'projectAppControlBar-saveDocumentButton',
  splashNew: 'splashPage-btn-new'
} as const

const DOCUMENT_LIFECYCLE_E2E_FAPROJECT = 'e2e-document-lifecycle.faproject'

const DOCUMENT_LIFECYCLE_E2E_DISPLAY_NAME = 'E2E document lifecycle project'

const DOCUMENT_LIFECYCLE_E2E_INITIAL_NAME = 'E2E Lifecycle Doc'

const DOCUMENT_LIFECYCLE_E2E_RENAMED_NAME = 'E2E Lifecycle Renamed'

let e2eLifecyclePersistedDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, DOCUMENT_LIFECYCLE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(DOCUMENT_LIFECYCLE_E2E_DISPLAY_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, DOCUMENT_LIFECYCLE_E2E_DISPLAY_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedEditableDocumentTab (
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
        }
      ]
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return document.id
  }, DOCUMENT_LIFECYCLE_E2E_INITIAL_NAME)
  return documentId
}

test.describe.serial('Document lifecycle E2E — UI rename and save', () => {
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
        tryUnlinkE2eFaprojectFixture(DOCUMENT_LIFECYCLE_E2E_FAPROJECT)
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

  test('Rename document in edit mode and save from the control bar', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    e2eLifecyclePersistedDocumentId = await seedEditableDocumentTab(appWindow)
    expect(e2eLifecyclePersistedDocumentId.length).toBeGreaterThan(0)

    await appWindow.evaluate(async (documentId) => {
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
      await router.replace({ path: `/home/document/${documentId}` })
    }, e2eLifecyclePersistedDocumentId)

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
    await expect(nameInput).toBeVisible({ timeout: 15_000 })
    await nameInput.fill(DOCUMENT_LIFECYCLE_E2E_RENAMED_NAME)
    await appWindow.locator(`[data-test-locator="${selectorList.saveDocumentButton}"]`).click()
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eLifecyclePersistedDocumentId}"]`
      )
    ).toContainText(DOCUMENT_LIFECYCLE_E2E_RENAMED_NAME, { timeout: 15_000 })
    await expect(nameInput).toHaveCount(0)
    await expect(
      appWindow.locator('[data-test-locator="documentWorkspacePage-previewTitle"]')
    ).toHaveText(DOCUMENT_LIFECYCLE_E2E_RENAMED_NAME)
  })
})

test.describe.serial('Document lifecycle E2E — cold restart keeps renamed display name', () => {
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

  test('Restore renamed document label after cold restart', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, DOCUMENT_LIFECYCLE_E2E_DISPLAY_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eLifecyclePersistedDocumentId}"]`
      )
    ).toContainText(DOCUMENT_LIFECYCLE_E2E_RENAMED_NAME)
    await expectFaPlaywrightE2eHashRoute(
      appWindow,
      `/home/document/${e2eLifecyclePersistedDocumentId}`
    )
    await expect(
      appWindow.locator('[data-test-locator="documentWorkspacePage-previewTitle"]')
    ).toHaveText(DOCUMENT_LIFECYCLE_E2E_RENAMED_NAME, { timeout: 15_000 })
  })
})
