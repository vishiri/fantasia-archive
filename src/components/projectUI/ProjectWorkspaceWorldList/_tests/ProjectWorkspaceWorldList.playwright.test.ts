import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { patchFaPlaywrightComponentHarnessStores } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessPiniaSeed'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'

const extraEnvSettings = {
  COMPONENT_NAME: 'ProjectWorkspaceWorldList',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components' as const
}

const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

const selectorList = {
  item: 'projectWorkspaceWorldList-item',
  root: 'projectWorkspaceWorldList'
} as const

const sampleWorkspaceWorlds: I_faProjectHierarchyTreeWorkspaceWorld[] = [
  {
    color: '#112233',
    colorPalette: '',
    displayName: 'Eldoria',
    groups: [],
    id: 'world-eldoria',
    placements: [],
    sortOrder: 0
  },
  {
    color: '#445566',
    colorPalette: '',
    displayName: 'Mirefall',
    groups: [],
    id: 'world-mirefall',
    placements: [],
    sortOrder: 1
  }
]

async function remountWorldListAfterStoreSeed (
  page: Page,
  worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
): Promise<void> {
  await page.waitForFunction(() => {
    return typeof window.__faComponentTestingPatchStores === 'function'
  }, { timeout: 30_000 })
  await patchFaPlaywrightComponentHarnessStores(page, {
    workspaceWorlds: worlds
  })
  await page.waitForTimeout(faFrontendRenderTimer)
}

test.describe.serial('Project workspace world list', () => {
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
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * ProjectWorkspaceWorldList
   * Renders seeded hierarchy-derived world names in list order.
   */
  test('Check if seeded worlds render in list order', async () => {
    await remountWorldListAfterStoreSeed(appWindow, sampleWorkspaceWorlds)

    const root = appWindow.locator(`[data-test-locator="${selectorList.root}"]`)
    await expect(root).toBeVisible({ timeout: 15_000 })

    const items = appWindow.locator(`[data-test-locator="${selectorList.item}"]`)
    await expect(items).toHaveCount(2)
    await expect(items.nth(0)).toHaveText('Eldoria')
    await expect(items.nth(0)).toHaveAttribute('data-test-world-id', 'world-eldoria')
    await expect(items.nth(1)).toHaveText('Mirefall')
    await expect(items.nth(1)).toHaveAttribute('data-test-world-id', 'world-mirefall')
  })

  /**
   * ProjectWorkspaceWorldList
   * Empty seed hides the list root.
   */
  test('Check if empty seed hides the world list root', async () => {
    await remountWorldListAfterStoreSeed(appWindow, [])

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.root}"]`)
    ).toHaveCount(0)
  })
})
