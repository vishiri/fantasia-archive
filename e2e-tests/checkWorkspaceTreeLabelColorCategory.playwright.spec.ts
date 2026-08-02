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
  e2eExpandWorldAndPlacementNodes,
  e2eGetDocumentById,
  e2eHierarchyTreeSelectorList,
  e2eHydrateOpenedDocumentsAndRoute,
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
  backgroundColorInput: 'documentWorkspacePage-backgroundColorInput',
  createBtn: 'dialogNewProject-button-create',
  documentNameInput: 'documentWorkspacePage-nameInput',
  hierarchyTreeHost: 'projectHierarchyTree-host',
  isCategoryToggle: 'documentWorkspacePage-isCategoryToggle',
  nameInput: 'dialogNewProject-input-name',
  saveDocumentButton: 'projectAppControlBar-saveDocumentButton',
  splashNew: 'splashPage-btn-new',
  textColorInput: 'documentWorkspacePage-textColorInput'
} as const

const TREE_LABEL_COLOR_E2E_FAPROJECT = 'e2e-tree-label-color-category.faproject'
const TREE_LABEL_COLOR_E2E_PROJECT_NAME = 'E2E tree label color category project'
const TREE_LABEL_COLOR_E2E_ORIGINAL_LABEL = 'E2E Label Color Original'
const TREE_LABEL_COLOR_E2E_RENAMED_LABEL = 'E2E Label Color Renamed'
const TREE_LABEL_COLOR_E2E_TEXT_COLOR = '#aabbcc'
const TREE_LABEL_COLOR_E2E_BACKGROUND_COLOR = '#112233'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eTreeLabelColorDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TREE_LABEL_COLOR_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TREE_LABEL_COLOR_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TREE_LABEL_COLOR_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function openSeededDocumentInEditMode (page: Page, documentLabel: string): Promise<void> {
  await e2eRefreshHierarchyTreeLayout(page)
  await e2eExpandWorldAndPlacementNodes(page)
  const leafRow = page.locator(
    `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
  ).filter({ hasText: documentLabel }).locator(
    'xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]'
  )
  await leafRow.locator(`[data-test-locator="${e2eHierarchyTreeSelectorList.editButton}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)).toBeVisible({
    timeout: 15_000
  })
}

test.describe.serial('Opened documents E2E — tree label colors and category refresh', () => {
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
        tryUnlinkE2eFaprojectFixture(TREE_LABEL_COLOR_E2E_FAPROJECT)
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

  test('Rename save updates tree row label and tab label together', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await e2eSeedHierarchyPlacementWithDocuments(appWindow, {
      documents: [
        {
          displayName: TREE_LABEL_COLOR_E2E_ORIGINAL_LABEL,
          sortOrder: 0
        }
      ],
      templateDisplayName: 'E2E Tree Label Template'
    })
    e2eTreeLabelColorDocumentId = seeded.documents[0]?.id ?? ''
    expect(e2eTreeLabelColorDocumentId.length).toBeGreaterThan(0)

    await openSeededDocumentInEditMode(appWindow, TREE_LABEL_COLOR_E2E_ORIGINAL_LABEL)
    await appWindow.locator(`[data-test-locator="${selectorList.documentNameInput}"]`).fill(
      TREE_LABEL_COLOR_E2E_RENAMED_LABEL
    )
    await appWindow.locator(`[data-test-locator="${selectorList.saveDocumentButton}"]`).click()

    const tab = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eTreeLabelColorDocumentId}"]`
    )
    await expect(tab).toContainText(TREE_LABEL_COLOR_E2E_RENAMED_LABEL, { timeout: 15_000 })

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await expect(
      appWindow.locator(
        `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
      ).filter({ hasText: TREE_LABEL_COLOR_E2E_RENAMED_LABEL })
    ).toHaveCount(1)
    await expect(
      appWindow.locator(
        `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
      ).filter({ hasText: TREE_LABEL_COLOR_E2E_ORIGINAL_LABEL })
    ).toHaveCount(0)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })

  test('Document colors update tab chrome and tree row appearance classes', async () => {
    expect(e2eTreeLabelColorDocumentId.length).toBeGreaterThan(0)

    await openSeededDocumentInEditMode(appWindow, TREE_LABEL_COLOR_E2E_RENAMED_LABEL)
    await appWindow.locator(`[data-test-locator="${selectorList.textColorInput}"]`).fill(
      TREE_LABEL_COLOR_E2E_TEXT_COLOR
    )
    await appWindow.locator(`[data-test-locator="${selectorList.backgroundColorInput}"]`).fill(
      TREE_LABEL_COLOR_E2E_BACKGROUND_COLOR
    )
    await appWindow.locator(`[data-test-locator="${selectorList.saveDocumentButton}"]`).click()

    const tab = appWindow.locator(
      `[data-test-locator="projectAppControlBar-tab-${e2eTreeLabelColorDocumentId}"]`
    )
    await expect(tab).toHaveClass(/projectAppControlBarTabs__tab--customAppearance/)
    await expect(tab).toHaveClass(/projectAppControlBarTabs__tab--customDocumentBackground/)
    await expect(tab).toHaveAttribute('style', /#aabbcc/i)
    await expect(tab).toHaveAttribute('style', /#112233/i)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    const treeNode = appWindow.locator(`[data-test-hierarchy-node-id="${e2eTreeLabelColorDocumentId}"]`)
    await expect(treeNode).toHaveClass(/projectHierarchyTreeNode--customDocumentAppearance/)
    await expect(treeNode).toHaveClass(/projectHierarchyTreeNode--customDocumentBackground/)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })

  test('Toggle isCategory refreshes tree node folder icon after save', async () => {
    expect(e2eTreeLabelColorDocumentId.length).toBeGreaterThan(0)

    await openSeededDocumentInEditMode(appWindow, TREE_LABEL_COLOR_E2E_RENAMED_LABEL)
    await appWindow.locator(`[data-test-locator="${selectorList.isCategoryToggle}-toggle"]`).click()
    await appWindow.locator(`[data-test-locator="${selectorList.saveDocumentButton}"]`).click()

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    const treeNode = appWindow.locator(`[data-test-hierarchy-node-id="${e2eTreeLabelColorDocumentId}"]`)
    await expect(treeNode.locator('.projectHierarchyTreeNode__icon')).toHaveAttribute('class', /mdi-folder-open/)

    const savedDocument = await e2eGetDocumentById(appWindow, e2eTreeLabelColorDocumentId)
    expect(savedDocument.isCategory).toBe(true)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps label color category state', () => {
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

  test('Cold restart restores renamed label colors and category folder icon', async () => {
    expect(e2eTreeLabelColorDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, TREE_LABEL_COLOR_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eTreeLabelColorDocumentId}"]`
      )
    ).toContainText(TREE_LABEL_COLOR_E2E_RENAMED_LABEL)

    const savedDocument = await e2eGetDocumentById(appWindow, e2eTreeLabelColorDocumentId)
    expect(savedDocument.displayName).toBe(TREE_LABEL_COLOR_E2E_RENAMED_LABEL)
    expect(savedDocument.documentTextColor?.toLowerCase()).toBe(
      TREE_LABEL_COLOR_E2E_TEXT_COLOR.toLowerCase()
    )
    expect(savedDocument.documentBackgroundColor?.toLowerCase()).toBe(
      TREE_LABEL_COLOR_E2E_BACKGROUND_COLOR.toLowerCase()
    )
    expect(savedDocument.isCategory).toBe(true)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await expect(
      appWindow.locator(
        `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
      ).filter({ hasText: TREE_LABEL_COLOR_E2E_RENAMED_LABEL })
    ).toHaveCount(1)
    const treeNode = appWindow.locator(`[data-test-hierarchy-node-id="${e2eTreeLabelColorDocumentId}"]`)
    await expect(treeNode.locator('.projectHierarchyTreeNode__icon')).toHaveAttribute('class', /mdi-folder-open/)
    await e2eClickHierarchyDocumentLabel(appWindow, TREE_LABEL_COLOR_E2E_RENAMED_LABEL)
    await e2eHydrateOpenedDocumentsAndRoute(appWindow, e2eTreeLabelColorDocumentId)
    await expectFaPlaywrightE2eHashRoute(appWindow, `/home/document/${e2eTreeLabelColorDocumentId}`)
  })
})
