import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { patchFaPlaywrightComponentHarnessStores } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessPiniaSeed'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import { FA_PROJECT_SIDEBAR_MIN_WIDTH_PX } from 'app/types/I_faProjectSidebarDomain'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'

const extraEnvSettings = {
  COMPONENT_NAME: 'ProjectHierarchyTreeSearch',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components' as const
}

const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

const selectorList = {
  projectHierarchyTreeSearch: 'projectHierarchyTreeSearch',
  projectHierarchyTreeSearchInput: 'projectHierarchyTreeSearch-input'
} as const

async function remountHierarchyTreeSearchAfterStoreSeed (
  page: Page,
  seed: I_faComponentTestingStoreSeed
): Promise<void> {
  await page.waitForFunction(() => {
    return typeof window.__faComponentTestingPatchStores === 'function'
  }, { timeout: 30_000 })
  await patchFaPlaywrightComponentHarnessStores(page, seed)
  await page.evaluate(async () => {
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
    await router.replace({ path: '/componentTesting/ProjectHierarchyTreeSearch' })
  })
  await page.locator(`[data-test-locator="${selectorList.projectHierarchyTreeSearch}"]`).waitFor({
    state: 'visible',
    timeout: 30_000
  })
  await page.waitForTimeout(faFrontendRenderTimer)
}

test.describe.serial('Project hierarchy tree search layout', () => {
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
    await remountHierarchyTreeSearchAfterStoreSeed(appWindow, {
      disableAppControlBar: false
    })
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Check if search uses fixed 375px width when the app control bar is enabled', async () => {
    const search = appWindow.locator(`[data-test-locator="${selectorList.projectHierarchyTreeSearch}"]`)
    await expect(search).toHaveClass(/projectHierarchyTreeSearch--layoutFixed375/)
    await expect(search).toHaveCSS('width', `${FA_PROJECT_SIDEBAR_MIN_WIDTH_PX}px`)
  })

  test('Check if disabling the app control bar makes search follow the sidebar width', async () => {
    await remountHierarchyTreeSearchAfterStoreSeed(appWindow, {
      disableAppControlBar: true
    })

    const search = appWindow.locator(`[data-test-locator="${selectorList.projectHierarchyTreeSearch}"]`)
    await expect(search).toHaveClass(/projectHierarchyTreeSearch--layoutFollowSidebar/)
    await expect(search).toHaveCSS('width', `${FA_PROJECT_SIDEBAR_MIN_WIDTH_PX}px`)
  })

  test('Check if focusing the search field expands it to the full viewport width', async () => {
    await remountHierarchyTreeSearchAfterStoreSeed(appWindow, {
      disableAppControlBar: false
    })

    const input = appWindow.locator(`[data-test-locator="${selectorList.projectHierarchyTreeSearchInput}"] input`)
    await input.click()
    const search = appWindow.locator(`[data-test-locator="${selectorList.projectHierarchyTreeSearch}"]`)
    await expect(search).toHaveClass(/projectHierarchyTreeSearch--layoutFullViewport/)
    const viewportWidthPx = await appWindow.evaluate(() => {
      return window.innerWidth
    })
    await expect(search).toHaveCSS('width', `${viewportWidthPx}px`)
  })
})
