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
  addUnderButton: 'projectHierarchyTree-documentButton-addUnder',
  createBtn: 'dialogNewProject-button-create',
  editButton: 'projectHierarchyTree-documentButton-edit',
  hierarchyTree: 'projectHierarchyTree',
  hierarchyTreeHost: 'projectHierarchyTree-host',
  nameInput: 'dialogNewProject-input-name',
  nodeTemplatePlacement: 'projectHierarchyTree-node-templatePlacement',
  nodeWorld: 'projectHierarchyTree-node-world',
  openButton: 'projectHierarchyTree-documentButton-open',
  orderNumberBadge: 'projectHierarchyTree-orderNumberBadge',
  splashNew: 'splashPage-btn-new'
} as const

const TREE_CHROME_E2E_FAPROJECT = 'e2e-tree-chrome-settings-persist.faproject'
const TREE_CHROME_E2E_PROJECT_NAME = 'E2E tree chrome settings persist project'
const TREE_CHROME_E2E_DOC_LABEL = 'E2E Tree Chrome Doc'
const TREE_CHROME_E2E_ORDER_NUMBER = 7
const USER_SETTINGS_PERSIST_SETTLE_MS = 750

let e2eTreeChromeDocumentId = ''

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, TREE_CHROME_E2E_FAPROJECT)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(TREE_CHROME_E2E_PROJECT_NAME)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, TREE_CHROME_E2E_PROJECT_NAME)
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

async function seedTreeDocumentAndRefreshHierarchy (
  page: Page
): Promise<string> {
  return page.evaluate(async (input) => {
    const content = window.faContentBridgeAPIs?.projectContent
    if (content === undefined) {
      throw new Error('Project content bridge unavailable')
    }
    const worlds = await content.listWorlds()
    const world = worlds.items[0]
    if (world === undefined) {
      throw new Error('No default world in E2E project')
    }
    const template = await content.createDocumentTemplate({
      displayName: 'E2E Tree Chrome Template'
    })
    const placementId = crypto.randomUUID()
    await content.saveDocumentTemplatesSnapshot([{
      id: template.id,
      titlePluralTranslations: { 'en-US': 'Characters' },
      titleSingularTranslations: { 'en-US': 'Character' },
      icon: 'mdi-file-document'
    }])
    await content.saveWorldsSnapshot([{
      id: world.id,
      displayNameTranslations: { 'en-US': world.displayName },
      color: world.color,
      colorPalette: world.colorPalette,
      templateLayout: {
        groups: [],
        placements: [{
          id: placementId,
          documentTemplateId: template.id,
          groupId: null,
          rootSortOrder: 0,
          groupSortOrder: null,
          nickname: 'Characters',
          nicknamePluralTranslations: { 'en-US': 'Characters' },
          nicknameSingularTranslations: { 'en-US': 'Character' }
        }]
      }
    }])
    const createdDocument = await content.createDocument({
      displayName: input.displayName,
      worldId: world.id,
      templateId: template.id,
      placementId,
      treeOrderNumber: input.treeOrderNumber
    })
    const root = globalThis.document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                refreshLayout?: () => Promise<void>
              }>
            }
          }
        }
      }
    }
    const hierarchyStore = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaProjectHierarchyTree')
    if (typeof hierarchyStore?.refreshLayout === 'function') {
      await hierarchyStore.refreshLayout()
    }
    return createdDocument.id
  }, {
    displayName: TREE_CHROME_E2E_DOC_LABEL,
    treeOrderNumber: TREE_CHROME_E2E_ORDER_NUMBER
  })
}

async function refreshHierarchyTreeLayout (page: Page): Promise<void> {
  await page.evaluate(async () => {
    const root = globalThis.document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                refreshLayout?: () => Promise<void>
              }>
            }
          }
        }
      }
    }
    const hierarchyStore = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaProjectHierarchyTree')
    if (typeof hierarchyStore?.refreshLayout === 'function') {
      await hierarchyStore.refreshLayout()
    }
  })
}

async function expandWorldAndPlacementNodes (page: Page): Promise<void> {
  const worldOpenIcon = page.locator(
    `[data-test-locator="${selectorList.nodeWorld}"]`
  ).locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
    .locator('[data-test-locator="projectHierarchyTree-openIconWrapper"]')
  await worldOpenIcon.dispatchEvent('pointerdown')
  await worldOpenIcon.click({ force: true })

  const placementOpenIcon = page.locator(
    `[data-test-locator="${selectorList.nodeTemplatePlacement}"]`
  ).locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
    .locator('[data-test-locator="projectHierarchyTree-openIconWrapper"]')
  await expect(placementOpenIcon).toHaveCount(1, { timeout: 15_000 })
  await placementOpenIcon.dispatchEvent('pointerdown')
  await placementOpenIcon.click({ force: true })
}

test.describe.serial('Opened documents E2E — tree chrome settings before cold restart', () => {
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
        tryUnlinkE2eFaprojectFixture(TREE_CHROME_E2E_FAPROJECT)
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

  test('Tree chrome user settings hide lines order badges row icons and extra padding', async () => {
    await createE2eProjectOnWorkspaceRoute(appWindow, electronApp)
    e2eTreeChromeDocumentId = await seedTreeDocumentAndRefreshHierarchy(appWindow)
    expect(e2eTreeChromeDocumentId.length).toBeGreaterThan(0)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expandWorldAndPlacementNodes(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.orderNumberBadge}"]`)
    ).toHaveText(String(TREE_CHROME_E2E_ORDER_NUMBER), { timeout: 15_000 })
    await expect.poll(async () => {
      return await appWindow.locator(
        `[data-test-locator="${selectorList.hierarchyTree}"] .tree-line`
      ).count()
    }).toBeGreaterThan(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.openButton}"]`)
    ).not.toHaveCount(0)

    await patchUserSettingsSilentlyViaPinia(appWindow, {
      extraTreePadding: true,
      hideTreeIconAddUnder: true,
      hideTreeIconEdit: true,
      hideTreeIconView: true,
      hideTreeLines: true,
      hideTreeOrderNumbers: true
    })
    await appWindow.waitForTimeout(USER_SETTINGS_PERSIST_SETTLE_MS)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTree}"]`)
    ).toHaveClass(/projectHierarchyTree--extraPadding/)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTree}"]`)
    ).toHaveCSS('padding-left', '30px')
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.hierarchyTree}"] .projectHierarchyTree-treeNode--world`
      )
    ).toHaveCSS('margin-left', '-18px')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.orderNumberBadge}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTree}"] .tree-line`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.openButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.editButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.addUnderButton}"]`)
    ).toHaveCount(0)
  })
})

test.describe.serial('Opened documents E2E — cold restart keeps tree chrome settings', () => {
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

  test('Cold restart keeps hide tree chrome flags on hierarchy tree', async () => {
    expect(e2eTreeChromeDocumentId.length).toBeGreaterThan(0)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, TREE_CHROME_E2E_PROJECT_NAME)
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTreeHost}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await refreshHierarchyTreeLayout(appWindow)

    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        const root = globalThis.document.querySelector('#q-app') as HTMLElement & {
          __vue_app__?: {
            config: {
              globalProperties: {
                $pinia?: {
                  _s?: Map<string, {
                    settings?: {
                      extraTreePadding?: boolean
                      hideTreeIconAddUnder?: boolean
                      hideTreeIconEdit?: boolean
                      hideTreeIconView?: boolean
                      hideTreeLines?: boolean
                      hideTreeOrderNumbers?: boolean
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
          extraTreePadding: settings.extraTreePadding,
          hideTreeIconAddUnder: settings.hideTreeIconAddUnder,
          hideTreeIconEdit: settings.hideTreeIconEdit,
          hideTreeIconView: settings.hideTreeIconView,
          hideTreeLines: settings.hideTreeLines,
          hideTreeOrderNumbers: settings.hideTreeOrderNumbers
        }
      })
    }).toEqual({
      extraTreePadding: true,
      hideTreeIconAddUnder: true,
      hideTreeIconEdit: true,
      hideTreeIconView: true,
      hideTreeLines: true,
      hideTreeOrderNumbers: true
    })

    const worldOpenIcon = appWindow.locator(
      `[data-test-locator="${selectorList.nodeWorld}"]`
    ).locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
      .locator('[data-test-locator="projectHierarchyTree-openIconWrapper"]')
    await expect(worldOpenIcon).toHaveCount(1, { timeout: 15_000 })
    await worldOpenIcon.dispatchEvent('pointerdown')
    await worldOpenIcon.click({ force: true })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTree}"]`)
    ).toHaveClass(/projectHierarchyTree--extraPadding/)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTree}"]`)
    ).toHaveCSS('padding-left', '30px')
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.hierarchyTree}"] .projectHierarchyTree-treeNode--world`
      )
    ).toHaveCSS('margin-left', '-18px')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.orderNumberBadge}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.hierarchyTree}"] .tree-line`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.openButton}"]`)
    ).toHaveCount(0)
  })
})
