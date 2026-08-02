import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import {
  e2eDeleteDocumentViaBridge,
  e2eExpandHierarchyDocumentNode,
  e2eExpandWorldAndPlacementNodes,
  e2eGetDocumentById,
  e2eHierarchyTreeSelectorList,
  e2eHydrateOpenedDocumentsAndRoute,
  e2eReadPlacementChildrenForParent,
  e2eRefreshHierarchyTreeLayout,
  e2eSeedHierarchyPlacementWithDocuments
} from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeHelpers'
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
  documentNameInput: 'documentWorkspacePage-nameInput',
  hierarchyTreeHost: 'projectHierarchyTree-host',
  nameInput: 'dialogNewProject-input-name',
  saveDocumentButton: 'projectAppControlBar-saveDocumentButton',
  splashNew: 'splashPage-btn-new'
} as const

const TEMP_PARENT_FALLBACK_E2E_FAPROJECT = 'e2e-temp-parent-fallback.faproject'
const TEMP_PARENT_FALLBACK_E2E_PROJECT_NAME = 'E2E temp parent fallback project'
const TEMP_PARENT_FALLBACK_E2E_GRANDPARENT_LABEL = 'E2E Fallback Grandparent'
const TEMP_PARENT_FALLBACK_E2E_PARENT_LABEL = 'E2E Fallback Parent'
const TEMP_PARENT_FALLBACK_E2E_CHILD_LABEL = 'E2E Fallback Child Saved'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eTempFallbackPlacementId = ''
let e2eTempFallbackGrandparentId = ''
let e2eTempFallbackParentId = ''
let e2eTempFallbackSavedChildId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TEMP_PARENT_FALLBACK_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TEMP_PARENT_FALLBACK_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TEMP_PARENT_FALLBACK_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

test.describe.serial('Opened documents E2E — temporary save parent-chain fallback', () => {
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
        tryUnlinkE2eFaprojectFixture(TEMP_PARENT_FALLBACK_E2E_FAPROJECT)
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

  test('Saving temporary child after parent delete resolves to grandparent in SQLite', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await e2eSeedHierarchyPlacementWithDocuments(appWindow, {
      documents: [
        {
          displayName: TEMP_PARENT_FALLBACK_E2E_GRANDPARENT_LABEL,
          isCategory: true,
          sortOrder: 0
        },
        {
          displayName: TEMP_PARENT_FALLBACK_E2E_PARENT_LABEL,
          sortOrder: 1
        }
      ],
      templateDisplayName: 'E2E Temp Fallback Template'
    })
    e2eTempFallbackPlacementId = seeded.placementId
    e2eTempFallbackGrandparentId = seeded.documents[0]?.id ?? ''
    e2eTempFallbackParentId = seeded.documents[1]?.id ?? ''
    expect(e2eTempFallbackPlacementId.length).toBeGreaterThan(0)
    expect(e2eTempFallbackGrandparentId.length).toBeGreaterThan(0)
    expect(e2eTempFallbackParentId.length).toBeGreaterThan(0)

    await appWindow.evaluate(async (input) => {
      const content = window.faContentBridgeAPIs?.projectContent
      if (content === undefined) {
        throw new Error('Project content bridge unavailable')
      }
      await content.updateDocument(input.parentId, {
        parentDocumentId: input.grandparentId
      })
    }, {
      grandparentId: e2eTempFallbackGrandparentId,
      parentId: e2eTempFallbackParentId
    })
    await e2eRefreshHierarchyTreeLayout(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await e2eExpandHierarchyDocumentNode(appWindow, e2eTempFallbackGrandparentId)

    const parentRow = appWindow.locator(
      `[data-test-hierarchy-node-id="${e2eTempFallbackParentId}"]`
    ).locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
    await parentRow.locator(
      `[data-test-locator="${e2eHierarchyTreeSelectorList.addUnderButton}"]`
    ).click({ force: true })

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
    await expect(nameInput).toBeVisible({ timeout: 15_000 })
    await nameInput.fill(TEMP_PARENT_FALLBACK_E2E_CHILD_LABEL)

    await e2eDeleteDocumentViaBridge(appWindow, e2eTempFallbackParentId)
    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await e2eExpandHierarchyDocumentNode(appWindow, e2eTempFallbackGrandparentId)

    await appWindow.locator(`[data-test-locator="${selectorList.saveDocumentButton}"]`).click()
    await expect(
      appWindow.locator('[data-test-locator="documentWorkspacePage-previewTitle"]')
    ).toHaveText(TEMP_PARENT_FALLBACK_E2E_CHILD_LABEL, { timeout: 15_000 })

    e2eTempFallbackSavedChildId = await appWindow.evaluate(() => {
      const root = document.querySelector('#q-app') as HTMLElement & {
        __vue_app__?: {
          config: {
            globalProperties: {
              $pinia?: {
                _s?: Map<string, {
                  activeDocumentId?: string | null
                }>
              }
            }
          }
        }
      }
      return root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaOpenedDocuments')?.activeDocumentId ?? ''
    })
    expect(e2eTempFallbackSavedChildId.length).toBeGreaterThan(0)

    const savedChild = await e2eGetDocumentById(appWindow, e2eTempFallbackSavedChildId)
    expect(savedChild.parentDocumentId).toBe(e2eTempFallbackGrandparentId)

    const children = await e2eReadPlacementChildrenForParent(
      appWindow,
      e2eTempFallbackPlacementId,
      e2eTempFallbackGrandparentId
    )
    expect(children.some((row) => row.id === e2eTempFallbackSavedChildId)).toBe(true)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps parent-chain fallback child', () => {
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

  test('Cold restart keeps fallback child under grandparent in tree and SQLite', async () => {
    expect(e2eTempFallbackSavedChildId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, TEMP_PARENT_FALLBACK_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    const savedChild = await e2eGetDocumentById(appWindow, e2eTempFallbackSavedChildId)
    expect(savedChild.parentDocumentId).toBe(e2eTempFallbackGrandparentId)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await e2eExpandHierarchyDocumentNode(appWindow, e2eTempFallbackGrandparentId)
    await expect(
      appWindow.locator(
        `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
      ).filter({ hasText: TEMP_PARENT_FALLBACK_E2E_CHILD_LABEL })
    ).toHaveCount(1)
    await e2eHydrateOpenedDocumentsAndRoute(appWindow, e2eTempFallbackSavedChildId)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTempFallbackSavedChildId}`)
  })
})
