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
  projectDocumentControlBarDeleteActionSeparator: 'projectDocumentControlBar-deleteActionSeparator',
  projectDocumentControlBarDeleteDocumentButton: 'projectDocumentControlBar-deleteDocumentButton',
  projectDocumentControlBarEditDocumentButton: 'projectDocumentControlBar-editDocumentButton',
  projectDocumentControlBarSaveDocumentButton: 'projectDocumentControlBar-saveDocumentButton',
  projectDocumentControlBarSaveDocumentKeepEditModeButton: 'projectDocumentControlBar-saveDocumentKeepEditModeButton',
  projectDocumentControlBarTab: 'projectDocumentControlBar-tab-doc-hero',
  projectDocumentControlBarTabClose: 'projectDocumentControlBar-tabClose-doc-hero',
  projectDocumentControlBarTabContextMenu: 'projectDocumentControlBar-tabContextMenu',
  projectDocumentControlBarTabContextMenuBrowseOpenedTabs: 'projectDocumentControlBar-tabContextMenu-browseOpenedTabs',
  projectDocumentControlBarTabContextMenuBrowseSubmenu: 'projectDocumentControlBar-tabContextMenu-browseSubmenu',
  projectDocumentControlBarTabContextMenuCloseAllTabsWithoutChanges: 'projectDocumentControlBar-tabContextMenu-closeAllTabsWithoutChanges',
  projectDocumentControlBarTabContextMenuCloseAllTabsWithoutChangesExceptThisOne: 'projectDocumentControlBar-tabContextMenu-closeAllTabsWithoutChangesExceptThisOne',
  projectDocumentControlBarTabContextMenuCloseThisTab: 'projectDocumentControlBar-tabContextMenu-closeThisTab',
  projectDocumentControlBarTabContextMenuCopyName: 'projectDocumentControlBar-tabContextMenu-copyName',
  projectDocumentControlBarTabContextMenuCopyTextColor: 'projectDocumentControlBar-tabContextMenu-copyTextColor',
  projectDocumentControlBarTabContextMenuCopyBackgroundColor: 'projectDocumentControlBar-tabContextMenu-copyBackgroundColor',
  projectDocumentControlBarTabContextMenuDeleteThisDocument: 'projectDocumentControlBar-tabContextMenu-deleteThisDocument',
  projectDocumentControlBarTabContextMenuForceCloseAllTabs: 'projectDocumentControlBar-tabContextMenu-forceCloseAllTabs',
  projectDocumentControlBarTabContextMenuForceCloseAllTabsExceptThisOne: 'projectDocumentControlBar-tabContextMenu-forceCloseAllTabsExceptThisOne',
  projectDocumentControlBarTabContextMenuMoveTabLeft: 'projectDocumentControlBar-tabContextMenu-moveTabLeft',
  projectDocumentControlBarTabVillain: 'projectDocumentControlBar-tab-doc-villain',
  projectDocumentControlBarTabPlace: 'projectDocumentControlBar-tab-doc-place'
} as const

const sampleOpenedDocumentTabs = [
  {
    documentId: 'doc-hero',
    persistenceState: 'persisted',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    displayNameDraft: 'Hero',
    savedDisplayName: 'Hero',
    documentTextColorDraft: '',
    savedDocumentTextColor: '',
    documentBackgroundColorDraft: '',
    savedDocumentBackgroundColor: '',
    hasUnsavedChanges: false,
    editState: false
  },
  {
    documentId: 'doc-villain',
    persistenceState: 'persisted',
    tabLabel: 'Character',
    templateIcon: 'mdi-skull',
    displayNameDraft: 'Villain draft',
    savedDisplayName: 'Villain',
    documentTextColorDraft: '',
    savedDocumentTextColor: '',
    documentBackgroundColorDraft: '',
    savedDocumentBackgroundColor: '',
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
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarDeleteDocumentButton}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarDeleteActionSeparator}"]`)
    ).toHaveCount(1)
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
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarDeleteDocumentButton}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarDeleteActionSeparator}"]`)
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

  test('Check if right-clicking a tab opens the tab context menu with browse submenu and close action', async () => {
    await remountDocumentControlBarAfterStoreSeed(appWindow, {
      disableDocumentControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectDocumentControlBarTab}"]`)
      .click({ button: 'right' })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenu}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuBrowseOpenedTabs}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuCopyName}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuMoveTabLeft}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuCloseThisTab}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuCloseAllTabsWithoutChangesExceptThisOne}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuCloseAllTabsWithoutChanges}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuForceCloseAllTabsExceptThisOne}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuForceCloseAllTabs}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuDeleteThisDocument}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuForceCloseAllTabsExceptThisOne}"]`)
    ).toHaveClass(/text-secondary/)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuForceCloseAllTabs}"]`)
    ).toHaveClass(/text-secondary/)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuDeleteThisDocument}"]`)
    ).toHaveClass(/text-secondary/)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuBrowseOpenedTabs}"]`)
      .hover()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuBrowseSubmenu}"]`)
    ).toBeVisible()
    await expect(
      appWindow.getByText('Villain draft', { exact: true })
    ).toHaveCount(1)
    await expect(
      appWindow.locator('[data-test-locator="projectDocumentControlBar-tabContextMenu-browseTab"][data-test-browse-tab-document-id="doc-villain"] .projectDocumentControlBarTabContextMenu__browseTabUnsavedIcon')
    ).toHaveCount(1)
    await expect(
      appWindow.locator('[data-test-locator="projectDocumentControlBar-tabContextMenu-browseTab"][data-test-browse-tab-document-id="doc-hero"] .projectDocumentControlBarTabContextMenu__browseTabUnsavedIcon')
    ).toHaveCount(0)
  })

  test('Check if close this tab from the context menu closes a clean tab', async () => {
    await remountDocumentControlBarAfterStoreSeed(appWindow, {
      disableDocumentControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectDocumentControlBarTab}"]`)
      .click({ button: 'right' })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuCloseThisTab}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTab}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabVillain}"]`)
    ).toHaveCount(1)
  })

  test('Check if close all tabs without changes except this one keeps dirty tabs and the right-clicked tab', async () => {
    await remountDocumentControlBarAfterStoreSeed(appWindow, {
      disableDocumentControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [
          ...sampleOpenedDocumentTabs,
          {
            documentId: 'doc-place',
            persistenceState: 'persisted',
            tabLabel: 'Place',
            templateIcon: 'mdi-map-marker',
            displayNameDraft: 'Place',
            savedDisplayName: 'Place',
            documentTextColorDraft: '',
            savedDocumentTextColor: '',
            documentBackgroundColorDraft: '',
            savedDocumentBackgroundColor: '',
            hasUnsavedChanges: false,
            editState: false
          }
        ]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectDocumentControlBarTab}"]`)
      .click({ button: 'right' })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabContextMenuCloseAllTabsWithoutChangesExceptThisOne}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTab}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabVillain}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectDocumentControlBarTabPlace}"]`)
    ).toHaveCount(0)
  })
})
