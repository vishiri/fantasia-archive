import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import {
  e2eExpandWorldAndPlacementNodes,
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
  hierarchyTreeHost: 'projectHierarchyTree-host',
  nameInput: 'dialogNewProject-input-name',
  nodeTemplatePlacementLabel: 'projectHierarchyTree-node-templatePlacement-label',
  nodeTagLabel: 'projectHierarchyTree-node-tag-label',
  nodeTagWrapperLabel: 'projectHierarchyTree-node-tagWrapper-label',
  splashNew: 'splashPage-btn-new'
} as const

const TREE_TAG_SETTINGS_E2E_FAPROJECT = 'e2e-tree-tag-settings-persist.faproject'
const TREE_TAG_SETTINGS_E2E_PROJECT_NAME = 'E2E tree tag settings persist project'
const TREE_TAG_SETTINGS_E2E_DOC_LABEL = 'E2E Tree Tag Settings Doc'
const TREE_TAG_SETTINGS_E2E_TAG_NAME = 'Places'
const USER_SETTINGS_PERSIST_SETTLE_MS = 750

let e2eTreeTagSettingsDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TREE_TAG_SETTINGS_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TREE_TAG_SETTINGS_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TREE_TAG_SETTINGS_E2E_PROJECT_NAME)
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

test.describe.serial('Opened documents E2E — tree tag settings before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(TREE_TAG_SETTINGS_E2E_FAPROJECT)
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

  /**
   * Seed tagged docs then assert compactTags, noTags, and tagsAtTop chrome via silent settings patch.
   */
  test('Tree tag user settings toggle compact noTags and tagsAtTop layout', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    const seeded = await e2eSeedDocumentsWithTagsAndRefresh(appWindow, {
      documents: [{ displayName: TREE_TAG_SETTINGS_E2E_DOC_LABEL }],
      tagsByDocumentDisplayName: {
        [TREE_TAG_SETTINGS_E2E_DOC_LABEL]: [{ name: TREE_TAG_SETTINGS_E2E_TAG_NAME }]
      },
      templateDisplayName: 'E2E Tree Tag Settings Template'
    })
    e2eTreeTagSettingsDocumentId = seeded.documents[0]?.id ?? ''
    expect(e2eTreeTagSettingsDocumentId.length).toBeGreaterThan(0)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await e2eExpandWorldAndTagNode(appWindow, TREE_TAG_SETTINGS_E2E_TAG_NAME)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeTagLabel}"]`).filter({
        hasText: TREE_TAG_SETTINGS_E2E_TAG_NAME
      })
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeTagWrapperLabel}"]`)
    ).toHaveCount(0)

    await patchUserSettingsSilentlyViaPinia(appWindow, {
      compactTags: true,
      noTags: false,
      tagsAtTop: false
    })
    await appWindow.waitForTimeout(USER_SETTINGS_PERSIST_SETTLE_MS)
    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndTagNode(appWindow, TREE_TAG_SETTINGS_E2E_TAG_NAME)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeTagWrapperLabel}"]`)
    ).toBeVisible({ timeout: 15_000 })

    await patchUserSettingsSilentlyViaPinia(appWindow, {
      compactTags: false,
      noTags: true,
      tagsAtTop: false
    })
    await appWindow.waitForTimeout(USER_SETTINGS_PERSIST_SETTLE_MS)
    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndPlacementNodes(appWindow)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeTagLabel}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeTagWrapperLabel}"]`)
    ).toHaveCount(0)

    await patchUserSettingsSilentlyViaPinia(appWindow, {
      compactTags: false,
      noTags: false,
      tagsAtTop: true
    })
    await appWindow.waitForTimeout(USER_SETTINGS_PERSIST_SETTLE_MS)
    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndTagNode(appWindow, TREE_TAG_SETTINGS_E2E_TAG_NAME)
    const tagBox = await appWindow.locator(`[data-test-locator="${selectorList.nodeTagLabel}"]`)
      .filter({ hasText: TREE_TAG_SETTINGS_E2E_TAG_NAME })
      .boundingBox()
    const placementBox = await appWindow.locator(
      `[data-test-locator="${selectorList.nodeTemplatePlacementLabel}"]`
    ).first().boundingBox()
    expect(tagBox).not.toBeNull()
    expect(placementBox).not.toBeNull()
    expect((tagBox?.y ?? 0) < (placementBox?.y ?? 0)).toBe(true)

    await patchUserSettingsSilentlyViaPinia(appWindow, {
      compactTags: true,
      noTags: false,
      tagsAtTop: false
    })
    await appWindow.waitForTimeout(USER_SETTINGS_PERSIST_SETTLE_MS)
    await e2eRefreshHierarchyTreeLayout(appWindow)
    await e2eExpandWorldAndTagNode(appWindow, TREE_TAG_SETTINGS_E2E_TAG_NAME)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeTagWrapperLabel}"]`)
    ).toBeVisible({ timeout: 15_000 })
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps tree tag settings', () => {
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
      afterClose (): void {
        tryUnlinkE2eFaprojectFixture(TREE_TAG_SETTINGS_E2E_FAPROJECT)
      },
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * Splash resume keeps compactTags and shows the Tags wrapper after cold restart.
   */
  test('Cold restart keeps compactTags wrapper on hierarchy tree', async () => {
    expect(e2eTreeTagSettingsDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, TREE_TAG_SETTINGS_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await e2eRefreshHierarchyTreeLayout(appWindow)

    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        const root = globalThis.document.querySelector('#q-app') as HTMLElement & {
          __vue_app__?: {
            config: {
              globalProperties: {
                $pinia?: {
                  _s?: Map<string, {
                    settings?: {
                      compactTags?: boolean
                      noTags?: boolean
                      tagsAtTop?: boolean
                    }
                  }>
                }
              }
            }
          }
        }
        const settings = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaUserSettings')?.settings
        if (settings === undefined) {
          return null
        }
        return {
          compactTags: settings.compactTags,
          noTags: settings.noTags,
          tagsAtTop: settings.tagsAtTop
        }
      })
    }).toEqual({
      compactTags: true,
      noTags: false,
      tagsAtTop: false
    })

    await e2eExpandWorldAndTagNode(appWindow, TREE_TAG_SETTINGS_E2E_TAG_NAME)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeTagWrapperLabel}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeTagLabel}"]`).filter({
        hasText: TREE_TAG_SETTINGS_E2E_TAG_NAME
      })
    ).toBeVisible()
  })
})
