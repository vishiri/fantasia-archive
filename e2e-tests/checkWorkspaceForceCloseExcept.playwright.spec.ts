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
  forceCloseExcept: 'projectAppControlBar-tabContextMenu-forceCloseAllTabsExceptThisOne',
  nameInput: 'dialogNewProject-input-name',
  projectAppControlBar: 'projectAppControlBar',
  splashNew: 'splashPage-btn-new'
} as const

const FORCE_CLOSE_E2E_FAPROJECT = 'e2e-force-close-except.faproject'
const FORCE_CLOSE_E2E_PROJECT_NAME = 'E2E force close except project'
const FORCE_CLOSE_E2E_LABEL_A = 'E2E Force Close A'
const FORCE_CLOSE_E2E_LABEL_B = 'E2E Force Close B'
const FORCE_CLOSE_E2E_LABEL_C = 'E2E Force Close C'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eForceCloseKeptDocumentId = ''
let e2eForceCloseClosedDocumentIdA = ''
let e2eForceCloseClosedDocumentIdC = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, FORCE_CLOSE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(FORCE_CLOSE_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, FORCE_CLOSE_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedThreeOpenedDocumentTabsWithDirtySibling (
  page: Page
): Promise<{ idA: string, idB: string, idC: string }> {
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
      hasUnsavedChanges: boolean
    ) => {
      return {
        displayNameDraft: tabLabel,
        documentId,
        persistenceState: 'persisted' as const,
        hasUnsavedChanges,
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
        tagsDraft: [],
        savedTags: [],
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
    const documentC = await content.createDocument({
      displayName: labels.labelC,
      worldId: world.id
    })
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: documentB.id,
      schemaVersion: 1,
      tabs: [
        buildPersistedTab(documentA.id, labels.labelA, true),
        buildPersistedTab(documentB.id, labels.labelB, false),
        buildPersistedTab(documentC.id, labels.labelC, true)
      ]
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return {
      idA: documentA.id,
      idB: documentB.id,
      idC: documentC.id
    }
  }, {
    labelA: FORCE_CLOSE_E2E_LABEL_A,
    labelB: FORCE_CLOSE_E2E_LABEL_B,
    labelC: FORCE_CLOSE_E2E_LABEL_C
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

test.describe.serial('Opened documents E2E — force close except before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(FORCE_CLOSE_E2E_FAPROJECT)
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

  test('Force close all except kept tab (dirty siblings, no discard prompts)', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await seedThreeOpenedDocumentTabsWithDirtySibling(appWindow)
    e2eForceCloseClosedDocumentIdA = seeded.idA
    e2eForceCloseKeptDocumentId = seeded.idB
    e2eForceCloseClosedDocumentIdC = seeded.idC
    expect(e2eForceCloseKeptDocumentId.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsAndRoute(appWindow, e2eForceCloseKeptDocumentId)

    const keptTab = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eForceCloseKeptDocumentId}"]`
    )
    const tabA = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eForceCloseClosedDocumentIdA}"]`
    )
    const tabC = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eForceCloseClosedDocumentIdC}"]`
    )
    await expect(keptTab).toBeVisible({ timeout: 15_000 })
    await expect(tabA).toBeVisible()
    await expect(tabC).toBeVisible()

    await keptTab.click({ button: 'right' })
    await appWindow.locator(
      `[data-test-locator="${selectorList.forceCloseExcept}"]`
    ).click()

    await expect(keptTab).toBeVisible({ timeout: 15_000 })
    await expect(tabA).toHaveCount(0)
    await expect(tabC).toHaveCount(0)
    await expect(
      appWindow.locator('[data-test-locator="dialogDiscardOpenedDocumentTab"]')
    ).toHaveCount(0)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restore after force close except', () => {
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

  test('Only the force-close-except kept tab restores after cold restart', async () => {
    expect(e2eForceCloseKeptDocumentId.length).toBeGreaterThan(0)
    expect(e2eForceCloseClosedDocumentIdA.length).toBeGreaterThan(0)
    expect(e2eForceCloseClosedDocumentIdC.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, FORCE_CLOSE_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eForceCloseKeptDocumentId}"]`
      )
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eForceCloseClosedDocumentIdA}"]`
      )
    ).toHaveCount(0)
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eForceCloseClosedDocumentIdC}"]`
      )
    ).toHaveCount(0)
    await expect(appWindow.getByText(FORCE_CLOSE_E2E_LABEL_B, { exact: true })).toHaveCount(1)
    await expect(appWindow.getByText(FORCE_CLOSE_E2E_LABEL_A, { exact: true })).toHaveCount(0)
    await expect(appWindow.getByText(FORCE_CLOSE_E2E_LABEL_C, { exact: true })).toHaveCount(0)
  })
})
