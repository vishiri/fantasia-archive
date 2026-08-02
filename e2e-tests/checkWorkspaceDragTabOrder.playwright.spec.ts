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
  splashNew: 'splashPage-btn-new'
} as const

const DRAG_TAB_E2E_FAPROJECT = 'e2e-drag-tab-order.faproject'
const DRAG_TAB_E2E_PROJECT_NAME = 'E2E drag tab order project'
const DRAG_TAB_E2E_LABEL_A = 'E2E Drag Tab A'
const DRAG_TAB_E2E_LABEL_B = 'E2E Drag Tab B'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750
const TAB_DRAG_SETTLE_MS = 400

let e2eDragTabIdA = ''
let e2eDragTabIdB = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, DRAG_TAB_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(DRAG_TAB_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, DRAG_TAB_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedTwoPersistedOpenedDocumentTabs (
  page: Page
): Promise<{ idA: string, idB: string }> {
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
      idA: documentA.id,
      idB: documentB.id
    }
  }, {
    labelA: DRAG_TAB_E2E_LABEL_A,
    labelB: DRAG_TAB_E2E_LABEL_B
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

async function readOpenedTabDocumentIds (page: Page): Promise<string[]> {
  return page.locator('[data-test-locator^="projectAppControlBar-tab-"]').evaluateAll((nodes) => {
    return nodes.map((node) => {
      const locator = node.getAttribute('data-test-locator') ?? ''
      return locator.replace('projectAppControlBar-tab-', '')
    })
  })
}

test.describe.serial('Opened documents E2E — drag-reorder tabs before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(DRAG_TAB_E2E_FAPROJECT)
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

  test('Drag-reorder two tabs and persist strip order', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await seedTwoPersistedOpenedDocumentTabs(appWindow)
    e2eDragTabIdA = seeded.idA
    e2eDragTabIdB = seeded.idB
    expect(e2eDragTabIdA.length).toBeGreaterThan(0)
    expect(e2eDragTabIdB.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsAndRoute(appWindow, e2eDragTabIdA)
    const tabA = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eDragTabIdA}"]`
    )
    const tabB = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eDragTabIdB}"]`
    )
    await expect(tabA).toBeVisible({ timeout: 15_000 })
    await expect(tabB).toBeVisible()
    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }, { timeout: 15_000 }).toEqual([e2eDragTabIdA, e2eDragTabIdB])

    const boxA = await tabA.boundingBox()
    const boxB = await tabB.boundingBox()
    expect(boxA).not.toBeNull()
    expect(boxB).not.toBeNull()

    await appWindow.mouse.move(
      boxA!.x + boxA!.width / 2,
      boxA!.y + boxA!.height / 2
    )
    await appWindow.mouse.down()
    await appWindow.mouse.move(
      boxB!.x + boxB!.width / 2,
      boxB!.y + boxB!.height / 2,
      { steps: 24 }
    )
    await appWindow.mouse.up()
    await appWindow.waitForTimeout(TAB_DRAG_SETTLE_MS)

    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }, { timeout: 15_000 }).toEqual([e2eDragTabIdB, e2eDragTabIdA])
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restore drag-reorder tab order', () => {
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

  test('Cold restart keeps drag-reordered tab strip', async () => {
    expect(e2eDragTabIdA.length).toBeGreaterThan(0)
    expect(e2eDragTabIdB.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, DRAG_TAB_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toBeVisible()
    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }, { timeout: 15_000 }).toEqual([e2eDragTabIdB, e2eDragTabIdA])
  })
})
