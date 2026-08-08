import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import {
  e2eExpandWorldAndPlacementNodes,
  e2eHydrateOpenedDocumentsAndRoute,
  e2eRefreshHierarchyTreeLayout,
  e2eSeedHierarchyPlacementWithDocuments
} from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeHelpers'
import { e2eExpandWorldAndTagNode } from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeTagsSeed'
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
import { FA_PLAYWRIGHT_PRESS_DEFAULT_SAVE_DOCUMENT } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
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
  splashNew: 'splashPage-btn-new',
  tagsInput: 'documentWorkspacePage-tagsInput',
  tagsInputChip: 'documentWorkspacePage-tagsInput-chip',
  tagLabel: 'projectHierarchyTree-node-tag-label'
} as const

const DOCUMENT_TAGS_E2E_FAPROJECT = 'e2e-workspace-document-tags.faproject'
const DOCUMENT_TAGS_E2E_PROJECT_NAME = 'E2E workspace document tags project'
const DOCUMENT_TAGS_E2E_DOC_LABEL = 'E2E Document Tags Doc'
const DOCUMENT_TAGS_E2E_TAG_NAME = 'Places'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eDocumentTagsDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, DOCUMENT_TAGS_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(DOCUMENT_TAGS_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, DOCUMENT_TAGS_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedOpenedDocumentTabInEditMode (
  page: Page,
  documentId: string,
  tabLabel: string
): Promise<void> {
  await page.evaluate(async (input) => {
    const content = window.faContentBridgeAPIs?.projectContent
    const management = window.faContentBridgeAPIs?.projectManagement
    if (content === undefined || management === undefined) {
      throw new Error('Project content or management bridge unavailable')
    }
    const listedTags = await content.listDocumentTags({ documentId: input.documentId })
    const tags = listedTags.items.map((tag) => {
      return {
        id: tag.id,
        name: tag.name
      }
    })
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: input.documentId,
      schemaVersion: 2,
      tabs: [{
        displayNameDraft: input.tabLabel,
        documentId: input.documentId,
        persistenceState: 'persisted',
        hasUnsavedChanges: false,
        editState: true,
        savedDisplayName: input.tabLabel,
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
        tagsDraft: tags,
        savedTags: tags,
        tabLabel: input.tabLabel,
        templateIcon: 'mdi-file-document'
      }]
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
  }, {
    documentId,
    tabLabel
  })
  await e2eHydrateOpenedDocumentsAndRoute(page, documentId)
}

async function createTagChipViaSelectInput (
  page: Page,
  tagName: string
): Promise<void> {
  // Quasar fallthrough puts data-test-locator on the native filter input itself.
  const tagsInput = page.locator(`[data-test-locator="${selectorList.tagsInput}"]`)
  await expect(tagsInput).toBeVisible({ timeout: 15_000 })
  await expect(tagsInput).not.toHaveAttribute('aria-disabled', 'true')
  await tagsInput.click()
  await tagsInput.fill(tagName)
  await tagsInput.press('Enter')
  await expect(
    page.locator(`[data-test-locator="${selectorList.tagsInputChip}"]`).filter({ hasText: tagName })
  ).toBeVisible({ timeout: 15_000 })
}

async function removeAllTagChips (page: Page): Promise<void> {
  const chips = page.locator(`[data-test-locator="${selectorList.tagsInputChip}"]`)
  await expect.poll(async () => {
    const count = await chips.count()
    if (count === 0) {
      return 0
    }
    const removeIcon = chips.first().locator('.q-chip__icon--remove')
    if (await removeIcon.count() > 0) {
      await removeIcon.click()
    } else {
      await chips.first().locator('button').first().click()
    }
    await page.waitForTimeout(100)
    return await chips.count()
  }, { timeout: 15_000 }).toBe(0)
}

test.describe.serial('Opened documents E2E — document tags save and hierarchy GC', () => {
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
        tryUnlinkE2eFaprojectFixture(DOCUMENT_TAGS_E2E_FAPROJECT)
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
        tryUnlinkE2eFaprojectFixture(DOCUMENT_TAGS_E2E_FAPROJECT)
      },
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * Create project, seed one document, add Places via Tags field, save, then expect tree tag row.
   */
  test('Create Places tag from document Tags field and show it in hierarchy', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await e2eSeedHierarchyPlacementWithDocuments(appWindow, {
      documents: [{ displayName: DOCUMENT_TAGS_E2E_DOC_LABEL }],
      templateDisplayName: 'E2E Document Tags Template'
    })
    const document = seeded.documents[0]
    expect(document).toBeDefined()
    e2eDocumentTagsDocumentId = document!.id
    expect(e2eDocumentTagsDocumentId.length).toBeGreaterThan(0)

    await seedOpenedDocumentTabInEditMode(
      appWindow,
      e2eDocumentTagsDocumentId,
      DOCUMENT_TAGS_E2E_DOC_LABEL
    )
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tagsInput}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`).click()

    await createTagChipViaSelectInput(appWindow, DOCUMENT_TAGS_E2E_TAG_NAME)
    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_SAVE_DOCUMENT)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndTagNode(appWindow, DOCUMENT_TAGS_E2E_TAG_NAME)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tagLabel}"]`).filter({
        hasText: DOCUMENT_TAGS_E2E_TAG_NAME
      })
    ).toBeVisible({ timeout: 15_000 })
  })

  /**
   * Clear all tag chips, save, and expect empty-tag GC to drop the hierarchy branch.
   */
  test('Remove all tags and GC empty Places branch from hierarchy', async () => {
    expect(e2eDocumentTagsDocumentId.length).toBeGreaterThan(0)
    await seedOpenedDocumentTabInEditMode(
      appWindow,
      e2eDocumentTagsDocumentId,
      DOCUMENT_TAGS_E2E_DOC_LABEL
    )
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tagsInputChip}"]`).filter({
        hasText: DOCUMENT_TAGS_E2E_TAG_NAME
      })
    ).toBeVisible({ timeout: 15_000 })

    await removeAllTagChips(appWindow)
    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_SAVE_DOCUMENT)
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)

    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tagLabel}"]`).filter({
        hasText: DOCUMENT_TAGS_E2E_TAG_NAME
      })
    ).toHaveCount(0)
  })

  /**
   * Reopen the same document in edit mode and expect chips to match saved empty tags.
   */
  test('Reopen document and match empty saved Tags chips', async () => {
    expect(e2eDocumentTagsDocumentId.length).toBeGreaterThan(0)
    await seedOpenedDocumentTabInEditMode(
      appWindow,
      e2eDocumentTagsDocumentId,
      DOCUMENT_TAGS_E2E_DOC_LABEL
    )
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tagsInput}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tagsInputChip}"]`)
    ).toHaveCount(0)
  })
})
