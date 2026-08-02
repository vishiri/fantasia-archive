import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { dragHierarchyTreeDocumentNodeWithHold } from 'app/helpers/playwrightHelpers_component/projectHierarchyTreeDocumentDrag'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import {
  e2eExpandHierarchyDocumentNode,
  e2eExpandWorldAndPlacementNodes,
  e2eGetDocumentById,
  e2eHierarchyTreeSelectorList,
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
  hierarchyTreeHost: 'projectHierarchyTree-host',
  nameInput: 'dialogNewProject-input-name',
  splashNew: 'splashPage-btn-new'
} as const

const TREE_DND_E2E_FAPROJECT = 'e2e-tree-dnd.faproject'
const TREE_DND_E2E_PROJECT_NAME = 'E2E tree DnD project'
const TREE_DND_E2E_PARENT_LABEL = 'E2E DnD Parent'
const TREE_DND_E2E_ALPHA_LABEL = 'E2E DnD Alpha'
const TREE_DND_E2E_BRAVO_LABEL = 'E2E DnD Bravo'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eTreeDndPlacementId = ''
let e2eTreeDndParentId = ''
let e2eTreeDndAlphaId = ''
let e2eTreeDndBravoId = ''
let e2eTreeDndExpectedRootOrder: string[] = []

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TREE_DND_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TREE_DND_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TREE_DND_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

test.describe.serial('Opened documents E2E — hierarchy tree document DnD', () => {
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
        tryUnlinkE2eFaprojectFixture(TREE_DND_E2E_FAPROJECT)
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

  test('DnD reparent nests document under belongs-under parent in SQLite and tree', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await e2eSeedHierarchyPlacementWithDocuments(appWindow, {
      documents: [
        {
          displayName: TREE_DND_E2E_PARENT_LABEL,
          isCategory: true,
          sortOrder: 0
        },
        {
          displayName: TREE_DND_E2E_ALPHA_LABEL,
          sortOrder: 1
        },
        {
          displayName: TREE_DND_E2E_BRAVO_LABEL,
          sortOrder: 2
        }
      ],
      templateDisplayName: 'E2E Tree DnD Template'
    })
    e2eTreeDndPlacementId = seeded.placementId
    e2eTreeDndParentId = seeded.documents[0]?.id ?? ''
    e2eTreeDndAlphaId = seeded.documents[1]?.id ?? ''
    e2eTreeDndBravoId = seeded.documents[2]?.id ?? ''
    expect(e2eTreeDndPlacementId.length).toBeGreaterThan(0)
    expect(e2eTreeDndParentId.length).toBeGreaterThan(0)
    expect(e2eTreeDndAlphaId.length).toBeGreaterThan(0)
    expect(e2eTreeDndBravoId.length).toBeGreaterThan(0)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await e2eExpandWorldAndPlacementNodes(appWindow)

    const placementSiblingLabels = appWindow.locator(
      `[role="treeitem"][aria-level="3"] [data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
    )
    await expect(placementSiblingLabels).toHaveCount(3)
    await expect(placementSiblingLabels.nth(0)).toHaveText(TREE_DND_E2E_PARENT_LABEL)
    await expect(placementSiblingLabels.nth(1)).toHaveText(TREE_DND_E2E_ALPHA_LABEL)
    await expect(placementSiblingLabels.nth(2)).toHaveText(TREE_DND_E2E_BRAVO_LABEL)

    await dragHierarchyTreeDocumentNodeWithHold(
      appWindow,
      e2eTreeDndAlphaId,
      e2eTreeDndParentId,
      { mode: 'nest-into-target' }
    )

    await expect.poll(async () => {
      return await appWindow.locator(
        `[data-test-hierarchy-node-id="${e2eTreeDndAlphaId}"]`
      ).locator('xpath=ancestor::*[@role="treeitem"][1]').getAttribute('aria-level')
    }, { timeout: 15_000 }).toBe('4')

    await expect(placementSiblingLabels).toHaveCount(2)
    await expect(placementSiblingLabels.nth(0)).toHaveText(TREE_DND_E2E_PARENT_LABEL)
    await expect(placementSiblingLabels.nth(1)).toHaveText(TREE_DND_E2E_BRAVO_LABEL)
    await expect(
      appWindow.locator(
        `[role="treeitem"][aria-level="4"] [data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
      ).filter({ hasText: TREE_DND_E2E_ALPHA_LABEL })
    ).toBeVisible({ timeout: 15_000 })

    const alphaDocument = await e2eGetDocumentById(appWindow, e2eTreeDndAlphaId)
    expect(alphaDocument.parentDocumentId).toBe(e2eTreeDndParentId)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })

  test('DnD sibling reorder persists SQLite root sibling order', async () => {
    expect(e2eTreeDndParentId.length).toBeGreaterThan(0)
    expect(e2eTreeDndBravoId.length).toBeGreaterThan(0)
    expect(e2eTreeDndPlacementId.length).toBeGreaterThan(0)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)

    const orderBeforeDrag = await e2eReadPlacementRootSiblingDisplayNames(
      appWindow,
      e2eTreeDndPlacementId
    )
    expect(orderBeforeDrag).toContain(TREE_DND_E2E_PARENT_LABEL)
    expect(orderBeforeDrag).toContain(TREE_DND_E2E_BRAVO_LABEL)
    expect(orderBeforeDrag).not.toContain(TREE_DND_E2E_ALPHA_LABEL)

    await dragHierarchyTreeDocumentNodeWithHold(
      appWindow,
      e2eTreeDndBravoId,
      e2eTreeDndParentId
    )

    await expect.poll(async () => {
      return e2eReadPlacementRootSiblingDisplayNames(appWindow, e2eTreeDndPlacementId)
    }, { timeout: 15_000 }).not.toEqual(orderBeforeDrag)
    e2eTreeDndExpectedRootOrder = await e2eReadPlacementRootSiblingDisplayNames(
      appWindow,
      e2eTreeDndPlacementId
    )
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps hierarchy DnD SQLite order', () => {
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

  test('Cold restart restores sibling order and reparented belongs-under parent', async () => {
    expect(e2eTreeDndPlacementId.length).toBeGreaterThan(0)
    expect(e2eTreeDndAlphaId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, TREE_DND_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await e2eExpandHierarchyDocumentNode(appWindow, e2eTreeDndParentId)

    await expect.poll(async () => {
      return e2eReadPlacementRootSiblingDisplayNames(appWindow, e2eTreeDndPlacementId)
    }, { timeout: 15_000 }).toEqual(e2eTreeDndExpectedRootOrder)

    const placementSiblingLabels = appWindow.locator(
      `[role="treeitem"][aria-level="3"] [data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
    )
    await expect(placementSiblingLabels).toHaveCount(2)
    await expect.poll(async () => {
      return placementSiblingLabels.allTextContents()
    }, { timeout: 15_000 }).toEqual(e2eTreeDndExpectedRootOrder)
    await expect(
      appWindow.locator(
        `[role="treeitem"][aria-level="4"] [data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
      ).filter({ hasText: TREE_DND_E2E_ALPHA_LABEL })
    ).toHaveCount(1)

    const alphaDocument = await e2eGetDocumentById(appWindow, e2eTreeDndAlphaId)
    expect(alphaDocument.parentDocumentId).toBe(e2eTreeDndParentId)
  })
})
