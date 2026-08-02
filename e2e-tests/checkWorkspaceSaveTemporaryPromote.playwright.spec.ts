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

const SAVE_TEMP_PROMOTE_E2E_FAPROJECT = 'e2e-save-temporary-promote.faproject'
const SAVE_TEMP_PROMOTE_E2E_PROJECT_NAME = 'E2E save temporary promote project'
const SAVE_TEMP_PROMOTE_E2E_DRAFT_LABEL = 'E2E Temporary Draft'
const SAVE_TEMP_PROMOTE_E2E_SAVED_LABEL = 'E2E Temporary Promoted'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eSaveTemporaryPromoteDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, SAVE_TEMP_PROMOTE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(SAVE_TEMP_PROMOTE_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, SAVE_TEMP_PROMOTE_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function createTemporaryTabViaStore (
  page: Page
): Promise<string> {
  return page.evaluate(async (draftLabel) => {
    const content = window.faContentBridgeAPIs?.projectContent
    if (content === undefined) {
      throw new Error('Project content bridge unavailable')
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
        displayName: 'E2E Promote Template'
      })
      templateId = template.id
    }
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                createTemporaryDocument?: (input: {
                  displayName: string
                  templateId: string
                  worldId: string
                }) => Promise<string>
                hydrateFromProjectDatabase?: () => Promise<void>
              }>
            }
          }
        }
      }
    }
    const openedDocumentsStore = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaOpenedDocuments')
    if (typeof openedDocumentsStore?.createTemporaryDocument !== 'function') {
      throw new Error('S_FaOpenedDocuments.createTemporaryDocument missing in E2E app')
    }
    await openedDocumentsStore.hydrateFromProjectDatabase?.()
    return await openedDocumentsStore.createTemporaryDocument({
      displayName: draftLabel,
      templateId,
      worldId: world.id
    })
  }, SAVE_TEMP_PROMOTE_E2E_DRAFT_LABEL)
}

test.describe.serial('Opened documents E2E — save promotes temporary tab before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(SAVE_TEMP_PROMOTE_E2E_FAPROJECT)
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

  test('Save keybind promotes temporary tab to persisted preview title', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    e2eSaveTemporaryPromoteDocumentId = await createTemporaryTabViaStore(appWindow)
    expect(e2eSaveTemporaryPromoteDocumentId.length).toBeGreaterThan(0)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`).click()

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
    await nameInput.fill(SAVE_TEMP_PROMOTE_E2E_SAVED_LABEL)
    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_SAVE_DOCUMENT)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentPreviewTitle}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentPreviewTitle}"]`)
    ).toHaveText(SAVE_TEMP_PROMOTE_E2E_SAVED_LABEL)
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eSaveTemporaryPromoteDocumentId}"]`
      )
    ).toContainText(SAVE_TEMP_PROMOTE_E2E_SAVED_LABEL)

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
      }, e2eSaveTemporaryPromoteDocumentId)
    }).toBe('persisted')

    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps promoted persisted tab', () => {
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

  test('Cold restart restores promoted document tab and preview title', async () => {
    expect(e2eSaveTemporaryPromoteDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, SAVE_TEMP_PROMOTE_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eSaveTemporaryPromoteDocumentId}"]`
      )
    ).toBeVisible({ timeout: 15_000 })
    await expectFaPlaywrightE2eHashRoute(
      appWindow,
      `/home/document/${e2eSaveTemporaryPromoteDocumentId}`
    )
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentPreviewTitle}"]`)
    ).toHaveText(SAVE_TEMP_PROMOTE_E2E_SAVED_LABEL, { timeout: 15_000 })
  })
})
