import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import {
  e2eClickHierarchySortByMode,
  e2eExpandHierarchyDocumentNode,
  e2eExpandWorldAndPlacementNodes,
  e2eHierarchyTreeSelectorList,
  e2eHydrateOpenedDocumentsAndRoute,
  e2eOpenHierarchyNodeContextMenu,
  e2eReadPlacementChildrenForParent,
  e2eReadPlacementRootSiblingDisplayNames,
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

const TREE_SORT_ADD_E2E_FAPROJECT = 'e2e-tree-sort-add.faproject'
const TREE_SORT_ADD_E2E_PROJECT_NAME = 'E2E tree sort add project'
const TREE_SORT_ADD_E2E_PARENT_LABEL = 'E2E Sort Parent'
const TREE_SORT_ADD_E2E_ZETA_LABEL = 'E2E Sort Zeta'
const TREE_SORT_ADD_E2E_ALPHA_LABEL = 'E2E Sort Alpha'
const TREE_SORT_ADD_E2E_CHILD_SAVED_LABEL = 'E2E Sort Add Under Saved'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eTreeSortPlacementId = ''
let e2eTreeSortParentId = ''
let e2eTreeSortAddUnderSavedId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TREE_SORT_ADD_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TREE_SORT_ADD_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TREE_SORT_ADD_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

test.describe.serial('Opened documents E2E — hierarchy sort and add-under save', () => {
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
        tryUnlinkE2eFaprojectFixture(TREE_SORT_ADD_E2E_FAPROJECT)
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

  test('Context Sort by namesDirectAsc persists sibling order in SQLite', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await e2eSeedHierarchyPlacementWithDocuments(appWindow, {
      documents: [
        {
          displayName: TREE_SORT_ADD_E2E_PARENT_LABEL,
          isCategory: true,
          sortOrder: 0
        },
        {
          displayName: TREE_SORT_ADD_E2E_ZETA_LABEL,
          sortOrder: 0
        },
        {
          displayName: TREE_SORT_ADD_E2E_ALPHA_LABEL,
          sortOrder: 1
        }
      ],
      templateDisplayName: 'E2E Tree Sort Template'
    })
    e2eTreeSortPlacementId = seeded.placementId
    e2eTreeSortParentId = seeded.documents[0]?.id ?? ''
    expect(e2eTreeSortPlacementId.length).toBeGreaterThan(0)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await e2eExpandWorldAndPlacementNodes(appWindow)

    await e2eOpenHierarchyNodeContextMenu(appWindow, e2eTreeSortPlacementId)
    await e2eClickHierarchySortByMode(appWindow, 'namesDirectAsc')

    await expect.poll(async () => {
      return e2eReadPlacementRootSiblingDisplayNames(appWindow, e2eTreeSortPlacementId)
    }, { timeout: 15_000 }).toEqual([
      TREE_SORT_ADD_E2E_ALPHA_LABEL,
      TREE_SORT_ADD_E2E_PARENT_LABEL,
      TREE_SORT_ADD_E2E_ZETA_LABEL
    ])
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })

  test('Add-under row button save promotes child under parent in SQLite', async () => {
    expect(e2eTreeSortParentId.length).toBeGreaterThan(0)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)

    const parentRow = appWindow.locator(
      `[data-test-hierarchy-node-id="${e2eTreeSortParentId}"]`
    ).locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
    await parentRow.locator(
      `[data-test-locator="${e2eHierarchyTreeSelectorList.addUnderButton}"]`
    ).click({ force: true })

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
    await expect(nameInput).toBeVisible({ timeout: 15_000 })
    await nameInput.fill(TREE_SORT_ADD_E2E_CHILD_SAVED_LABEL)
    await appWindow.locator(`[data-test-locator="${selectorList.saveDocumentButton}"]`).click()
    await expect(
      appWindow.locator('[data-test-locator="documentWorkspacePage-previewTitle"]')
    ).toHaveText(TREE_SORT_ADD_E2E_CHILD_SAVED_LABEL, { timeout: 15_000 })

    e2eTreeSortAddUnderSavedId = await appWindow.evaluate(() => {
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
    expect(e2eTreeSortAddUnderSavedId.length).toBeGreaterThan(0)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await e2eExpandHierarchyDocumentNode(appWindow, e2eTreeSortParentId)
    await expect(
      appWindow.locator(
        `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
      ).filter({ hasText: TREE_SORT_ADD_E2E_CHILD_SAVED_LABEL })
    ).toBeVisible({ timeout: 15_000 })

    const children = await e2eReadPlacementChildrenForParent(
      appWindow,
      e2eTreeSortPlacementId,
      e2eTreeSortParentId
    )
    expect(children.some((row) => row.displayName === TREE_SORT_ADD_E2E_CHILD_SAVED_LABEL)).toBe(true)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps sort and add-under child', () => {
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

  test('Cold restart restores sorted siblings and saved add-under child row', async () => {
    expect(e2eTreeSortPlacementId.length).toBeGreaterThan(0)
    expect(e2eTreeSortAddUnderSavedId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, TREE_SORT_ADD_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)

    await expect.poll(async () => {
      return e2eReadPlacementRootSiblingDisplayNames(appWindow, e2eTreeSortPlacementId)
    }, { timeout: 15_000 }).toEqual([
      TREE_SORT_ADD_E2E_ALPHA_LABEL,
      TREE_SORT_ADD_E2E_PARENT_LABEL,
      TREE_SORT_ADD_E2E_ZETA_LABEL
    ])

    const children = await e2eReadPlacementChildrenForParent(
      appWindow,
      e2eTreeSortPlacementId,
      e2eTreeSortParentId
    )
    expect(children.some((row) => row.id === e2eTreeSortAddUnderSavedId)).toBe(true)
    await e2eHydrateOpenedDocumentsAndRoute(appWindow, e2eTreeSortAddUnderSavedId)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeSortAddUnderSavedId}`)
  })
})
