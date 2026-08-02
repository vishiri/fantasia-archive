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
  nameInput: 'dialogNewProject-input-name',
  projectAppControlBar: 'projectAppControlBar',
  splashNew: 'splashPage-btn-new'
} as const

const TEMP_SURVIVE_E2E_FAPROJECT = 'e2e-temporary-survive-cold.faproject'
const TEMP_SURVIVE_E2E_PROJECT_NAME = 'E2E temporary survive cold project'
const TEMP_SURVIVE_E2E_TAB_LABEL = 'E2E Temporary Survive Tab'
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eTemporarySurviveDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TEMP_SURVIVE_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TEMP_SURVIVE_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TEMP_SURVIVE_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedTemporaryOpenedDocumentTabViaStore (
  page: Page
): Promise<string> {
  return page.evaluate(async (tabLabel) => {
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
        displayName: 'E2E Temporary Template'
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
                tabs?: I_faOpenedDocumentTab[]
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
    const documentId = await openedDocumentsStore.createTemporaryDocument({
      displayName: tabLabel,
      templateId,
      worldId: world.id
    })
    const tabs = (openedDocumentsStore.tabs ?? []) as I_faOpenedDocumentTab[]
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: documentId,
      schemaVersion: 2,
      tabs: tabs.map((tab) => {
        return {
          displayNameDraft: tab.displayNameDraft,
          documentId: tab.documentId,
          persistenceState: tab.persistenceState as I_faOpenedDocumentTab['persistenceState'],
          worldId: tab.worldId ?? world.id,
          templateId: tab.templateId ?? templateId,
          parentDocumentId: tab.parentDocumentId ?? null,
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
          tabLabel: tab.tabLabel,
          templateIcon: tab.templateIcon ?? 'mdi-file-document'
        }
      })
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return documentId
  }, TEMP_SURVIVE_E2E_TAB_LABEL)
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

test.describe.serial('Opened documents E2E — temporary tab survives cold hydrate', () => {
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
        tryUnlinkE2eFaprojectFixture(TEMP_SURVIVE_E2E_FAPROJECT)
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

  test('Temporary tab stays temporary after snapshot persist before cold restart', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    e2eTemporarySurviveDocumentId = await seedTemporaryOpenedDocumentTabViaStore(appWindow)
    expect(e2eTemporarySurviveDocumentId.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsAndRoute(appWindow, e2eTemporarySurviveDocumentId)
    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eTemporarySurviveDocumentId}"]`
      )
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentNameInput}"]`)
    ).toHaveValue(TEMP_SURVIVE_E2E_TAB_LABEL)

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
      }, e2eTemporarySurviveDocumentId)
    }).toBe('temporary')

    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps temporary tab', () => {
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

  test('Cold restart hydrates temporary tab still marked temporary in store', async () => {
    expect(e2eTemporarySurviveDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, TEMP_SURVIVE_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(
        `[data-test-locator="projectAppControlBar-tab-${e2eTemporarySurviveDocumentId}"]`
      )
    ).toBeVisible({ timeout: 15_000 })
    await expectFaPlaywrightE2eHashRoute(
      appWindow,
      `/home/document/${e2eTemporarySurviveDocumentId}`
    )

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
      }, e2eTemporarySurviveDocumentId)
    }).toBe('temporary')
  })
})
