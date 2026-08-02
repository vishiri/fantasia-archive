import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import {
  e2eClickHierarchyDocumentLabel,
} from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeLabelHelpers'
import {
  e2eExpandHierarchyDocumentNode,
  e2eExpandWorldAndPlacementNodes,
  e2eHierarchyTreeSelectorList,
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
  projectAppControlBar: 'projectAppControlBar',
  splashNew: 'splashPage-btn-new'
} as const

const TREE_SEARCH_E2E_FAPROJECT = 'e2e-tree-search.faproject'
const TREE_SEARCH_E2E_PROJECT_NAME = 'E2E tree search project'
const TREE_SEARCH_E2E_PARENT_LABEL = 'E2E Search Parent'
const TREE_SEARCH_E2E_LEAF_LABEL = 'E2E Searchable Leaf'
const TREE_SEARCH_E2E_QUERY = 'Searchable'
const SEARCH_DEBOUNCE_SETTLE_MS = 1200

let e2eTreeSearchLeafDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TREE_SEARCH_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TREE_SEARCH_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TREE_SEARCH_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

test.describe.serial('Opened documents E2E — hierarchy tree search reveal and open', () => {
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
        tryUnlinkE2eFaprojectFixture(TREE_SEARCH_E2E_FAPROJECT)
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

  test('Tree search reveals nested hit and opens a document tab', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await e2eSeedHierarchyPlacementWithDocuments(appWindow, {
      documents: [
        {
          displayName: TREE_SEARCH_E2E_PARENT_LABEL,
          isCategory: true,
          sortOrder: 0
        },
        {
          displayName: TREE_SEARCH_E2E_LEAF_LABEL,
          parentDocumentId: null,
          sortOrder: 1
        }
      ],
      templateDisplayName: 'E2E Tree Search Template'
    })
    const parentId = seeded.documents[0]?.id ?? ''
    e2eTreeSearchLeafDocumentId = seeded.documents[1]?.id ?? ''
    expect(parentId.length).toBeGreaterThan(0)
    expect(e2eTreeSearchLeafDocumentId.length).toBeGreaterThan(0)

    await appWindow.evaluate(async (input) => {
      const content = window.faContentBridgeAPIs?.projectContent
      if (content === undefined) {
        throw new Error('Project content bridge unavailable')
      }
      await content.updateDocument(input.leafId, {
        parentDocumentId: input.parentId
      })
    }, {
      leafId: e2eTreeSearchLeafDocumentId,
      parentId
    })
    await e2eRefreshHierarchyTreeLayout(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await e2eExpandWorldAndPlacementNodes(appWindow)

    const leafLabel = appWindow.locator(
      `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
    ).filter({ hasText: TREE_SEARCH_E2E_LEAF_LABEL })
    await expect(leafLabel).toHaveCount(0)

    const parentTreeItem = appWindow.locator(
      `[data-test-hierarchy-node-id="${parentId}"]`
    ).locator('xpath=ancestor::*[@role="treeitem"][1]')
    await e2eExpandHierarchyDocumentNode(appWindow, parentId)
    await expect(leafLabel).toBeVisible({ timeout: 15_000 })
    await parentTreeItem.locator(
      '[data-test-locator="projectHierarchyTree-openIconWrapper"]'
    ).dispatchEvent('pointerdown')
    await parentTreeItem.locator(
      '[data-test-locator="projectHierarchyTree-openIconWrapper"]'
    ).click({ force: true })
    await expect(leafLabel).toHaveCount(0, { timeout: 15_000 })

    const searchInput = appWindow.locator(
      `[data-test-locator="${e2eHierarchyTreeSelectorList.searchInput}"] input`
    )
    await expect(searchInput).toBeVisible({ timeout: 15_000 })
    await searchInput.fill(TREE_SEARCH_E2E_QUERY)
    await appWindow.waitForTimeout(SEARCH_DEBOUNCE_SETTLE_MS)

    await expect(leafLabel).toBeVisible({ timeout: 15_000 })
    await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'true')

    await e2eClickHierarchyDocumentLabel(appWindow, TREE_SEARCH_E2E_LEAF_LABEL)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeSearchLeafDocumentId}`)
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eTreeSearchLeafDocumentId}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toBeVisible()
  })
})
