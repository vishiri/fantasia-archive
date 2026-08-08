import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import {
  e2eHierarchyTreeSelectorList,
  e2eRefreshHierarchyTreeLayout
} from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeHelpers'
import {
  e2eExpandWorldAndTagNode,
  e2eSeedDocumentsWithTagsAndRefresh
} from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeTagsSeed'
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
  deleteTagDialog: 'projectHierarchyTree-deleteTagDialog',
  deleteTagDialogConfirm: 'projectHierarchyTree-deleteTagDialog-confirm',
  hierarchyTreeHost: 'projectHierarchyTree-host',
  nameInput: 'dialogNewProject-input-name',
  nodeContextMenuDeleteTag: 'projectHierarchyTree-nodeContextMenu-deleteTag',
  nodeContextMenuRenameTag: 'projectHierarchyTree-nodeContextMenu-renameTag',
  nodeDocumentLabel: 'projectHierarchyTree-node-document-label',
  nodeTagLabel: 'projectHierarchyTree-node-tag-label',
  renameTagDialog: 'projectHierarchyTree-renameTagDialog',
  renameTagDialogConfirm: 'projectHierarchyTree-renameTagDialog-confirm',
  renameTagDialogMergeWarning: 'projectHierarchyTree-renameTagDialog-mergeWarning',
  renameTagDialogName: 'projectHierarchyTree-renameTagDialog-name',
  splashNew: 'splashPage-btn-new'
} as const

const TREE_TAGS_E2E_FAPROJECT = 'e2e-workspace-tree-tags.faproject'
const TREE_TAGS_E2E_PROJECT_NAME = 'E2E workspace tree tags project'
const TREE_TAGS_E2E_DOC_A = 'E2E Tree Tags Doc A'
const TREE_TAGS_E2E_DOC_B = 'E2E Tree Tags Doc B'
const TREE_TAGS_E2E_TAG_ALPHA = 'Alpha'
const TREE_TAGS_E2E_TAG_BETA = 'Beta'
const TREE_TAGS_E2E_TAG_RENAMED = 'Alpha Renamed'
const TREE_ACTION_SETTLE_MS = 500

let e2eTreeTagsSeeded = false

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TREE_TAGS_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TREE_TAGS_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TREE_TAGS_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

function tagLabelLocator (page: Page, name: string) {
  return page.locator(`[data-test-locator="${selectorList.nodeTagLabel}"]`).filter({
    hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
  })
}

async function openTagContextMenu (page: Page, tagName: string): Promise<void> {
  const label = tagLabelLocator(page, tagName)
  await expect(label).toBeVisible({ timeout: 15_000 })
  await label.click({ button: 'right' })
}

test.describe.serial('Opened documents E2E — hierarchy tree tag rename merge delete', () => {
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
        tryUnlinkE2eFaprojectFixture(TREE_TAGS_E2E_FAPROJECT)
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
      afterClose (): void {
        tryUnlinkE2eFaprojectFixture(TREE_TAGS_E2E_FAPROJECT)
      },
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * Seed two tags on different docs, rename Alpha, merge Beta into it, delete survivor, expand docs.
   */
  test('Rename merge delete tags and expand under-tag documents', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await e2eSeedDocumentsWithTagsAndRefresh(appWindow, {
      documents: [
        { displayName: TREE_TAGS_E2E_DOC_A },
        { displayName: TREE_TAGS_E2E_DOC_B }
      ],
      tagsByDocumentDisplayName: {
        [TREE_TAGS_E2E_DOC_A]: [
          { name: TREE_TAGS_E2E_TAG_ALPHA },
          { name: 'Shared' }
        ],
        [TREE_TAGS_E2E_DOC_B]: [
          { name: TREE_TAGS_E2E_TAG_BETA },
          { name: 'Shared' }
        ]
      },
      templateDisplayName: 'E2E Tree Tags Template'
    })
    expect(seeded.tagIdsByName[TREE_TAGS_E2E_TAG_ALPHA]).toBeTruthy()
    expect(seeded.tagIdsByName[TREE_TAGS_E2E_TAG_BETA]).toBeTruthy()
    expect(seeded.tagIdsByName.Shared).toBeTruthy()
    e2eTreeTagsSeeded = true

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await e2eExpandWorldAndTagNode(appWindow, TREE_TAGS_E2E_TAG_ALPHA)
    await expect(tagLabelLocator(appWindow, TREE_TAGS_E2E_TAG_ALPHA)).toBeVisible({ timeout: 15_000 })
    await expect(tagLabelLocator(appWindow, TREE_TAGS_E2E_TAG_BETA)).toBeVisible()

    await openTagContextMenu(appWindow, TREE_TAGS_E2E_TAG_ALPHA)
    await appWindow.locator(`[data-test-locator="${selectorList.nodeContextMenuRenameTag}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.renameTagDialog}"]`)
    ).toBeVisible({ timeout: 15_000 })
    // Quasar fallthrough puts data-test-locator on the native input (no nested input).
    await appWindow.locator(`[data-test-locator="${selectorList.renameTagDialogName}"]`)
      .fill(TREE_TAGS_E2E_TAG_RENAMED)
    await appWindow.locator(`[data-test-locator="${selectorList.renameTagDialogConfirm}"]`).click()
    await appWindow.waitForTimeout(TREE_ACTION_SETTLE_MS)
    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndTagNode(appWindow, TREE_TAGS_E2E_TAG_RENAMED)
    await expect(tagLabelLocator(appWindow, TREE_TAGS_E2E_TAG_RENAMED)).toBeVisible({ timeout: 15_000 })
    await expect(tagLabelLocator(appWindow, TREE_TAGS_E2E_TAG_ALPHA)).toHaveCount(0)

    await openTagContextMenu(appWindow, TREE_TAGS_E2E_TAG_BETA)
    await appWindow.locator(`[data-test-locator="${selectorList.nodeContextMenuRenameTag}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.renameTagDialog}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.renameTagDialogName}"]`)
      .fill(TREE_TAGS_E2E_TAG_RENAMED)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.renameTagDialogMergeWarning}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.renameTagDialogConfirm}"]`).click()
    await appWindow.waitForTimeout(TREE_ACTION_SETTLE_MS)
    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndTagNode(appWindow, TREE_TAGS_E2E_TAG_RENAMED)
    await expect(tagLabelLocator(appWindow, TREE_TAGS_E2E_TAG_RENAMED)).toHaveCount(1)
    await expect(tagLabelLocator(appWindow, TREE_TAGS_E2E_TAG_BETA)).toHaveCount(0)

    await openTagContextMenu(appWindow, TREE_TAGS_E2E_TAG_RENAMED)
    await appWindow.locator(`[data-test-locator="${selectorList.nodeContextMenuDeleteTag}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.deleteTagDialog}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.deleteTagDialogConfirm}"]`).click()
    await appWindow.waitForTimeout(TREE_ACTION_SETTLE_MS)
    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndTagNode(appWindow, 'Shared')
    await expect(tagLabelLocator(appWindow, TREE_TAGS_E2E_TAG_RENAMED)).toHaveCount(0)

    // e2eExpandWorldAndTagNode already expands Shared; do not toggle again (would collapse).
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeDocumentLabel}"]`).filter({
        hasText: TREE_TAGS_E2E_DOC_A
      })
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeDocumentLabel}"]`).filter({
        hasText: TREE_TAGS_E2E_DOC_B
      })
    ).toBeVisible()
    expect(e2eTreeTagsSeeded).toBe(true)
    await expect(
      appWindow.locator(`[data-test-locator="${e2eHierarchyTreeSelectorList.hierarchyTree}"]`)
    ).toBeVisible()
  })
})
