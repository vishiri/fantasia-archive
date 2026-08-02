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
import { FA_PLAYWRIGHT_PRESS_DEFAULT_SAVE_DOCUMENT } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

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
  documentPreviewTitle: 'documentWorkspacePage-previewTitle',
  nameInput: 'dialogNewProject-input-name',
  projectAppControlBar: 'projectAppControlBar',
  splashNew: 'splashPage-btn-new'
} as const

const COPY_TEMP_PROMOTE_E2E_FAPROJECT = 'e2e-copy-temporary-promote.faproject'
const COPY_TEMP_PROMOTE_E2E_PROJECT_NAME = 'E2E copy temporary promote project'
const COPY_TEMP_PROMOTE_E2E_SOURCE_LABEL = 'E2E Copy Source Doc'
const COPY_TEMP_PROMOTE_E2E_SAVED_LABEL = 'E2E Copy Temp Promoted'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eCopyTemporaryDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, COPY_TEMP_PROMOTE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(COPY_TEMP_PROMOTE_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, COPY_TEMP_PROMOTE_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedSourceTabAndCopyTemporaryViaStore (
  page: Page
): Promise<{ sourceDocumentId: string, temporaryDocumentId: string }> {
  return page.evaluate(async (sourceLabel) => {
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
    const templates = await content.listDocumentTemplates()
    let templateId = templates.items[0]?.id
    if (templateId === undefined) {
      const template = await content.createDocumentTemplate({
        displayName: 'E2E Copy Template'
      })
      templateId = template.id
    }
    const sourceDocument = await content.createDocument({
      displayName: sourceLabel,
      worldId: world.id,
      templateId,
      isFinished: true,
      isMinor: true,
      extraClasses: 'copy-source-extra'
    })
    const sourceTabSaved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: sourceDocument.id,
      schemaVersion: 2,
      tabs: [{
        displayNameDraft: sourceLabel,
        documentId: sourceDocument.id,
        persistenceState: 'persisted',
        hasUnsavedChanges: false,
        editState: false,
        savedDisplayName: sourceLabel,
        documentTextColorDraft: '',
        savedDocumentTextColor: '',
        documentBackgroundColorDraft: '',
        savedDocumentBackgroundColor: '',
        isCategoryDraft: false,
        savedIsCategory: false,
        isFinishedDraft: true,
        isMinorDraft: true,
        isDeadDraft: false,
        savedIsFinished: true,
        savedIsMinor: true,
        savedIsDead: false,
        parentDocumentIdDraft: '',
        savedParentDocumentId: '',
        treeOrderNumberDraft: '',
        savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
        extraClassesDraft: 'copy-source-extra',
        savedExtraClasses: 'copy-source-extra',
        tabLabel: sourceLabel,
        templateIcon: 'mdi-file-document'
      }]
    })
    if (!sourceTabSaved) {
      throw new Error('saveOpenedDocumentsSnapshot for source tab returned false')
    }
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                createTemporaryDocumentCopyFromOpenedTab?: (documentId: string) => Promise<string | null>
                hydrateFromProjectDatabase?: () => Promise<void>
                tabs?: I_faOpenedDocumentTab[]
              }>
            }
          }
        }
      }
    }
    const openedDocumentsStore = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaOpenedDocuments')
    if (typeof openedDocumentsStore?.createTemporaryDocumentCopyFromOpenedTab !== 'function') {
      throw new Error('S_FaOpenedDocuments.createTemporaryDocumentCopyFromOpenedTab missing in E2E app')
    }
    await openedDocumentsStore.hydrateFromProjectDatabase?.()
    const temporaryDocumentId = await openedDocumentsStore.createTemporaryDocumentCopyFromOpenedTab(
      sourceDocument.id
    )
    if (temporaryDocumentId === null) {
      throw new Error('createTemporaryDocumentCopyFromOpenedTab returned null')
    }
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: temporaryDocumentId,
      schemaVersion: 2,
      tabs: (openedDocumentsStore.tabs ?? []).map((tab) => {
        const tabLabel = tab.documentId === sourceDocument.id
          ? sourceLabel
          : 'Character'
        return {
          displayNameDraft: tab.displayNameDraft,
          documentId: tab.documentId,
          persistenceState: tab.persistenceState as I_faOpenedDocumentTab['persistenceState'],
          worldId: world.id,
          templateId,
          parentDocumentId: null,
          hasUnsavedChanges: tab.hasUnsavedChanges,
          editState: tab.editState,
          savedDisplayName: tab.savedDisplayName,
          documentTextColorDraft: tab.documentTextColorDraft ?? '',
          savedDocumentTextColor: tab.savedDocumentTextColor ?? '',
          documentBackgroundColorDraft: tab.documentBackgroundColorDraft ?? '',
          savedDocumentBackgroundColor: tab.savedDocumentBackgroundColor ?? '',
          isCategoryDraft: tab.isCategoryDraft ?? false,
          savedIsCategory: tab.savedIsCategory ?? false,
          isFinishedDraft: tab.isFinishedDraft ?? false,
          isMinorDraft: tab.isMinorDraft ?? false,
          isDeadDraft: tab.isDeadDraft ?? false,
          savedIsFinished: tab.savedIsFinished ?? false,
          savedIsMinor: tab.savedIsMinor ?? false,
          savedIsDead: tab.savedIsDead ?? false,
          parentDocumentIdDraft: tab.parentDocumentIdDraft ?? '',
          savedParentDocumentId: tab.savedParentDocumentId ?? '',
          treeOrderNumberDraft: tab.treeOrderNumberDraft ?? '',
          savedTreeOrderNumber: tab.savedTreeOrderNumber ?? Number.MIN_SAFE_INTEGER,
          extraClassesDraft: tab.extraClassesDraft ?? '',
          savedExtraClasses: tab.savedExtraClasses ?? '',
          tabLabel,
          templateIcon: 'mdi-file-document'
        }
      })
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return {
      sourceDocumentId: sourceDocument.id,
      temporaryDocumentId
    }
  }, COPY_TEMP_PROMOTE_E2E_SOURCE_LABEL)
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

test.describe.serial('Opened documents E2E — copy temporary promote before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(COPY_TEMP_PROMOTE_E2E_FAPROJECT)
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

  test('Copy temporary tab save promotes to persisted preview title', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await seedSourceTabAndCopyTemporaryViaStore(appWindow)
    e2eCopyTemporaryDocumentId = seeded.temporaryDocumentId
    expect(seeded.sourceDocumentId.length).toBeGreaterThan(0)
    expect(e2eCopyTemporaryDocumentId.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsAndRoute(appWindow, e2eCopyTemporaryDocumentId)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`).click()

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
    await nameInput.fill(COPY_TEMP_PROMOTE_E2E_SAVED_LABEL)
    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_SAVE_DOCUMENT)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentPreviewTitle}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentPreviewTitle}"]`)
    ).toHaveText(COPY_TEMP_PROMOTE_E2E_SAVED_LABEL)
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eCopyTemporaryDocumentId}"]`
      )
    ).toContainText(COPY_TEMP_PROMOTE_E2E_SAVED_LABEL)

    await expect.poll(async () => {
      return await appWindow.evaluate((documentId) => {
        const root = document.querySelector('#q-app') as HTMLElement & {
          __vue_app__?: {
            config: {
              globalProperties: {
                $pinia?: {
                  _s?: Map<string, {
                    tabs?: Array<{ documentId: string, persistenceState: string }>
                  }>
                }
              }
            }
          }
        }
        const store = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaOpenedDocuments')
        const tab = store?.tabs?.find((row) => row.documentId === documentId)
        return tab?.persistenceState ?? null
      }, e2eCopyTemporaryDocumentId)
    }).toBe('persisted')

    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps copy-promoted tab', () => {
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

  test('Cold restart restores copy-promoted persisted tab title', async () => {
    expect(e2eCopyTemporaryDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, COPY_TEMP_PROMOTE_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eCopyTemporaryDocumentId}"]`
      )
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentPreviewTitle}"]`)
    ).toHaveText(COPY_TEMP_PROMOTE_E2E_SAVED_LABEL, { timeout: 15_000 })
  })
})
