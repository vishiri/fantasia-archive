import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { patchFaPlaywrightComponentHarnessStores } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessPiniaSeed'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import { FA_PROJECT_SIDEBAR_MIN_WIDTH_PX } from 'app/types/I_faProjectSidebarDomain'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'
import type { I_faProjectHierarchyTreeSearchHit } from 'app/types/I_faProjectHierarchyTreeDomain'

const extraEnvSettings = {
  COMPONENT_NAME: 'ProjectHierarchyTreeSearch',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components' as const
}

const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

const sampleSearchHit: I_faProjectHierarchyTreeSearchHit = {
  ancestorDocumentIds: [],
  displayName: 'Hero',
  documentId: 'doc-search-hit',
  placementId: 'placement-1',
  worldId: 'world-1'
}

const searchOverrideSeed: I_faComponentTestingStoreSeed = {
  disableAppControlBar: false,
  projectContentOverrides: {
    searchHitsByQuery: {
      '*': [sampleSearchHit]
    }
  }
}

const selectorList = {
  projectHierarchyTreeSearch: 'projectHierarchyTreeSearch',
  projectHierarchyTreeSearchClear: 'projectHierarchyTreeSearch-clear',
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

async function readHierarchySearchCallProbe (page: Page): Promise<{
  callCount: number
  lastQuery: string
}> {
  return page.evaluate(() => {
    return window.__faComponentTestingHierarchySearchProbe ?? {
      callCount: 0,
      lastQuery: ''
    }
  })
}

async function readHierarchySearchHitsCount (page: Page): Promise<number> {
  return page.evaluate(() => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                searchHits?: unknown[]
              }>
            }
          }
        }
      }
    }
    const store = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaProjectHierarchyTree')
    return store?.searchHits?.length ?? 0
  })
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

  test('Check if search debounce fires one override search after typing settles', async () => {
    await remountHierarchyTreeSearchAfterStoreSeed(appWindow, searchOverrideSeed)

    const input = appWindow.locator(`[data-test-locator="${selectorList.projectHierarchyTreeSearchInput}"] input`)
    await input.click()
    await input.pressSequentially('abc', { delay: 40 })

    await expect.poll(async () => {
      return readHierarchySearchCallProbe(appWindow)
    }, {
      timeout: 5_000
    }).toEqual({
      callCount: 1,
      lastQuery: 'abc'
    })
  })

  test('Check if whitespace-only query clears search without override search', async () => {
    await remountHierarchyTreeSearchAfterStoreSeed(appWindow, searchOverrideSeed)

    const input = appWindow.locator(`[data-test-locator="${selectorList.projectHierarchyTreeSearchInput}"] input`)
    await input.fill('hero')
    await expect.poll(async () => {
      return (await readHierarchySearchCallProbe(appWindow)).callCount
    }, {
      timeout: 5_000
    }).toBe(1)
    await expect.poll(async () => {
      return readHierarchySearchHitsCount(appWindow)
    }).toBe(1)

    const callsAfterQuery = (await readHierarchySearchCallProbe(appWindow)).callCount
    await input.fill('   ')
    await appWindow.waitForTimeout(500)
    const probe = await readHierarchySearchCallProbe(appWindow)
    expect(probe.callCount).toBe(callsAfterQuery)
    await expect.poll(async () => {
      return readHierarchySearchHitsCount(appWindow)
    }).toBe(0)
  })

  test('Check if clear control empties the query and clears search hits', async () => {
    await remountHierarchyTreeSearchAfterStoreSeed(appWindow, searchOverrideSeed)

    const input = appWindow.locator(`[data-test-locator="${selectorList.projectHierarchyTreeSearchInput}"] input`)
    await input.fill('hero')
    await expect.poll(async () => {
      return readHierarchySearchHitsCount(appWindow)
    }, {
      timeout: 5_000
    }).toBe(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectHierarchyTreeSearchClear}"]`)
    ).toBeVisible()

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectHierarchyTreeSearchClear}"]`)
      .click()
    await expect(input).toHaveValue('')
    await expect.poll(async () => {
      return readHierarchySearchHitsCount(appWindow)
    }).toBe(0)
  })
})
