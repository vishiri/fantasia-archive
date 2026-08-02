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
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

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
  splashNew: 'splashPage-btn-new'
} as const

const SCROLL_BUTTONS_E2E_FAPROJECT = 'e2e-tab-scroll-buttons-persist.faproject'
const SCROLL_BUTTONS_E2E_PROJECT_NAME = 'E2E tab scroll buttons persist project'
const SCROLL_BUTTONS_E2E_TAB_COUNT = 12
const USER_SETTINGS_PERSIST_SETTLE_MS = 750

let e2eScrollButtonsActiveDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, SCROLL_BUTTONS_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(SCROLL_BUTTONS_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, SCROLL_BUTTONS_E2E_PROJECT_NAME)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function patchUserSettingsSilentlyViaPinia (
  page: Page,
  patch: Partial<I_faUserSettings>
): Promise<void> {
  await page.evaluate(async (settingsPatch) => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                patchSettingsSilently?: (update: Record<string, unknown>) => Promise<void>
              }>
            }
          }
        }
      }
    }
    const userSettingsStore = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaUserSettings')
    if (typeof userSettingsStore?.patchSettingsSilently !== 'function') {
      throw new Error('S_FaUserSettings.patchSettingsSilently missing in E2E app')
    }
    await userSettingsStore.patchSettingsSilently(settingsPatch)
  }, patch)
}

async function seedOverflowOpenedDocumentTabs (
  page: Page,
  tabCount: number
): Promise<string> {
  return page.evaluate(async (count) => {
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

    const buildPersistedTab = (documentId: string, tabLabel: string) => {
      return {
        displayNameDraft: tabLabel,
        documentId,
        persistenceState: 'persisted' as const,
        hasUnsavedChanges: false,
        editState: false,
        savedDisplayName: tabLabel,
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
        tabLabel,
        templateIcon: 'mdi-file-document'
      }
    }

    const tabs = []
    let activeDocumentId = ''
    for (let index = 0; index < count; index += 1) {
      const tabLabel = `E2E Scroll Tab ${index}`
      const document = await content.createDocument({
        displayName: tabLabel,
        worldId: world.id
      })
      if (index === 0) {
        activeDocumentId = document.id
      }
      tabs.push(buildPersistedTab(document.id, tabLabel))
    }
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId,
      schemaVersion: 1,
      tabs
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return activeDocumentId
  }, tabCount)
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

test.describe.serial('Opened documents E2E — showTabBarScrollButtons before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(SCROLL_BUTTONS_E2E_FAPROJECT)
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

  test('showTabBarScrollButtons with overflow shows scroll chrome', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    await patchUserSettingsSilentlyViaPinia(appWindow, { showTabBarScrollButtons: true })
    e2eScrollButtonsActiveDocumentId = await seedOverflowOpenedDocumentTabs(
      appWindow,
      SCROLL_BUTTONS_E2E_TAB_COUNT
    )
    expect(e2eScrollButtonsActiveDocumentId.length).toBeGreaterThan(0)

    await hydrateOpenedDocumentsAndRoute(appWindow, e2eScrollButtonsActiveDocumentId)
    const tabsRoot = appWindow.locator('.projectAppControlBarTabs--header')
    await expect(tabsRoot).toHaveClass(/projectAppControlBarTabs--showScrollButtons/, {
      timeout: 15_000
    })
    await expect(
      appWindow.locator('.projectAppControlBarTabs--header .q-tabs__arrow')
    ).not.toHaveCount(0)
    await appWindow.waitForTimeout(USER_SETTINGS_PERSIST_SETTLE_MS)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps showTabBarScrollButtons', () => {
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

  test('Cold restart keeps scroll button chrome with overflow tabs', async () => {
    expect(e2eScrollButtonsActiveDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, SCROLL_BUTTONS_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    const tabsRoot = appWindow.locator('.projectAppControlBarTabs--header')
    await expect(tabsRoot).toHaveClass(/projectAppControlBarTabs--showScrollButtons/, {
      timeout: 15_000
    })
    await expect(
      appWindow.locator('.projectAppControlBarTabs--header .q-tabs__arrow')
    ).not.toHaveCount(0)
  })
})
