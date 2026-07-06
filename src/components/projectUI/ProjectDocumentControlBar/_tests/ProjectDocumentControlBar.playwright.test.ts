import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { patchFaPlaywrightComponentHarnessStores } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessPiniaSeed'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'

const extraEnvSettings = {
  COMPONENT_NAME: 'ProjectDocumentControlBar',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components' as const
}

const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

const selectorList = {
  dialogDiscardOpenedDocumentTab: 'dialogDiscardOpenedDocumentTab',
  projectDocumentControlBar: 'projectDocumentControlBar',
  projectDocumentControlBarEditDocumentButton: 'projectDocumentControlBar-editDocumentButton',
  projectDocumentControlBarSaveDocumentButton: 'projectDocumentControlBar-saveDocumentButton',
  projectDocumentControlBarSaveDocumentKeepEditModeButton: 'projectDocumentControlBar-saveDocumentKeepEditModeButton',
  projectDocumentControlBarTab: 'projectDocumentControlBar-tab-doc-hero',
  projectDocumentControlBarTabClose: 'projectDocumentControlBar-tabClose-doc-hero',
  projectDocumentControlBarTabVillain: 'projectDocumentControlBar-tab-doc-villain'
} as const

const sampleOpenedDocumentTabs = [
  {
    documentId: 'doc-hero',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    displayNameDraft: 'Hero',
    savedDisplayName: 'Hero',
    hasUnsavedChanges: false,
    editState: false
  },
  {
    documentId: 'doc-villain',
    tabLabel: 'Character',
    templateIcon: 'mdi-skull',
    displayNameDraft: 'Villain draft',
    savedDisplayName: 'Villain',
    hasUnsavedChanges: true,
    editState: false
  }
] as const

async function remountDocumentControlBarAfterStoreSeed (
  page: Page,
  seed: I_faComponentTestingStoreSeed
): Promise<void> {
  await page.waitForFunction(() => {
    return typeof window.__faComponentTestingPatchStores === 'function'
  }, { timeout: 30_000 })
  await patchFaPlaywrightComponentHarnessStores(page, seed)
  await page.evaluate(async (payload) => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $router: {
              replace: (location: { path: string }) => Promise<void>
            }
          }
        }
      }
    }
    const router = root?.__vue_app__?.config.globalProperties.$router
    if (router === undefined) {
      throw new Error('Vue router missing in component harness')
    }
    const routePath = payload.openedDocuments?.activeDocumentId !== undefined &&
      payload.openedDocuments.activeDocumentId !== null &&
      payload.openedDocuments.tabs.length > 0
      ? `/home/document/${payload.openedDocuments.activeDocumentId}`
      : '/componentTesting/ProjectDocumentControlBar'
    await router.replace({ path: routePath })
  }, seed)
  await page.waitForTimeout(faFrontendRenderTimer)
}

test.describe.serial('Project document control bar visibility', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightComponentHarnessWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          COMPONENT_NAME: extraEnvSettings.COMPONENT_NAME,
          COMPONENT_PROPS: extraEnvSettings.COMPONENT_PROPS,
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      renderDelayMs: faFrontendRenderTimer,
      testInfo
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
    await remountDocumentControlBarAfterStoreSeed(appWindow, {
      disableDocumentControlBar: false
    })
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Check if the document control bar renders when the setting is off', async () => {
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBar}"]`)
    ).toBeVisible()
  })

  test('Check if the document control bar hides when disable document control bar is on', async () => {
    await remountDocumentControlBarAfterStoreSeed(appWindow, {
      disableDocumentControlBar: true
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBar}"]`)
    ).toHaveCount(0)
  })

  test('Check if opened document tabs stay visible when disable document control bar is on', async () => {
    await remountDocumentControlBarAfterStoreSeed(appWindow, {
      disableDocumentControlBar: true,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBar}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTab}"]`)
    ).toHaveCount(1)
  })

  test('Check if seeded opened document tabs render in the control bar', async () => {
    await remountDocumentControlBarAfterStoreSeed(appWindow, {
      disableDocumentControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTab}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabClose}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.getByText('Hero', { exact: true })
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarEditDocumentButton}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarSaveDocumentButton}"]`)
    ).toHaveCount(0)
  })

  test('Check if save buttons appear when the active document tab is in edit mode', async () => {
    await remountDocumentControlBarAfterStoreSeed(appWindow, {
      disableDocumentControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [{
          ...sampleOpenedDocumentTabs[0],
          editState: true
        }]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarEditDocumentButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarSaveDocumentKeepEditModeButton}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarSaveDocumentButton}"]`)
    ).toHaveCount(1)
  })

  test('Check if middle-clicking a tab without unsaved changes closes it', async () => {
    await remountDocumentControlBarAfterStoreSeed(appWindow, {
      disableDocumentControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectDocumentControlBarTab}"]`)
      .click({ button: 'middle' })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTab}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabVillain}"]`)
    ).toHaveCount(1)
    await expect.poll(async () => {
      return appWindow.evaluate(() => {
        const root = document.querySelector('#q-app') as HTMLElement & {
          __vue_app__?: {
            config: {
              globalProperties: {
                $router: {
                  currentRoute: {
                    value: {
                      path: string
                    }
                  }
                }
              }
            }
          }
        }
        return root?.__vue_app__?.config.globalProperties.$router.currentRoute.value.path ?? ''
      })
    }).toBe('/home/document/doc-villain')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabVillain}"]`)
    ).toHaveClass(/q-tab--active/)
  })

  test('Check if middle-clicking a tab with unsaved changes opens the discard dialog', async () => {
    await remountDocumentControlBarAfterStoreSeed(appWindow, {
      disableDocumentControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-villain',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabVillain}"]`)
      .click({ button: 'middle' })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDiscardOpenedDocumentTab}"]`)
    ).toBeVisible()
  })
})
