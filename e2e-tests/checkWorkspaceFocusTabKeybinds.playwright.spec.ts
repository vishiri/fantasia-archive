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
import {
  FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_NEXT_DOCUMENT_TAB,
  FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_PREVIOUS_DOCUMENT_TAB
} from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
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

const FOCUS_TAB_E2E_FAPROJECT = 'e2e-focus-tab-keybinds.faproject'
const FOCUS_TAB_E2E_PROJECT_NAME = 'E2E focus tab keybinds project'
const FOCUS_TAB_E2E_LABEL_A = 'E2E Focus Tab A'
const FOCUS_TAB_E2E_LABEL_B = 'E2E Focus Tab B'
const FOCUS_TAB_E2E_LABEL_C = 'E2E Focus Tab C'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eFocusTabIdA = ''
let e2eFocusTabIdB = ''
let e2eFocusTabIdC = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, FOCUS_TAB_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(FOCUS_TAB_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, FOCUS_TAB_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedThreePersistedOpenedDocumentTabs (
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
    const documentC = await content.createDocument({
      displayName: labels.labelC,
      worldId: world.id
    })
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: documentB.id,
      schemaVersion: 1,
      tabs: [
        buildPersistedTab(documentA.id, labels.labelA),
        buildPersistedTab(documentB.id, labels.labelB),
        buildPersistedTab(documentC.id, labels.labelC)
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
    labelA: FOCUS_TAB_E2E_LABEL_A,
    labelB: FOCUS_TAB_E2E_LABEL_B,
    labelC: FOCUS_TAB_E2E_LABEL_C
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

test.describe.serial('Opened documents E2E — focus tab keybinds before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(FOCUS_TAB_E2E_FAPROJECT)
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

  test('Focus next and previous keybinds cycle active tab and persist last focus', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await seedThreePersistedOpenedDocumentTabs(appWindow)
    e2eFocusTabIdA = seeded.idA
    e2eFocusTabIdB = seeded.idB
    e2eFocusTabIdC = seeded.idC
    expect(e2eFocusTabIdA.length).toBeGreaterThan(0)
    expect(e2eFocusTabIdB.length).toBeGreaterThan(0)
    expect(e2eFocusTabIdC.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsAndRoute(appWindow, e2eFocusTabIdB)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eFocusTabIdB}`)
    await appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`).click()

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_NEXT_DOCUMENT_TAB)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eFocusTabIdC}`)

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_PREVIOUS_DOCUMENT_TAB)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eFocusTabIdB}`)

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_PREVIOUS_DOCUMENT_TAB)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eFocusTabIdA}`)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart restores last focused tab', () => {
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

  test('Cold restart opens the last focused document tab A', async () => {
    expect(e2eFocusTabIdA.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, FOCUS_TAB_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eFocusTabIdA}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eFocusTabIdA}`)
  })
})
