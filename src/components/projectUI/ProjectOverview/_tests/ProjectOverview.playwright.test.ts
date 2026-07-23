import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { patchFaPlaywrightComponentHarnessStores } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessPiniaSeed'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectOverviewMessages from 'app/i18n/en-US/components/projectUI/ProjectOverview/L_projectOverview'
import unsortedAppTexts from 'app/i18n/en-US/globalFunctionality/L_unsortedAppTexts'
import { mdListArrayConverter } from 'app/src/scripts/_utilities/functions/mdListArrayConverter'
import { specialCharacterFixer } from '../../../../../i18n/specialCharactersFixer'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'

const playwrightTestDir = path.dirname(fileURLToPath(import.meta.url))

const tipsTricksTriviaMarkdown = fs.readFileSync(
  path.resolve(playwrightTestDir, '../../../../../i18n/en-US/documents/tipsTricksTrivia.md'),
  'utf8'
)

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'ProjectOverview',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 */
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

const PLAYWRIGHT_PROJECT_OVERVIEW_NAME = 'Playwright Aurelion Overview'
const PLAYWRIGHT_PROJECT_OVERVIEW_FILE = 'C:\\Playwright\\aurelion-overview.faproject'
const PLAYWRIGHT_PROJECT_OVERVIEW_ID = 'playwright-project-overview-id'

const tipsTricksTriviaDocument = specialCharacterFixer(tipsTricksTriviaMarkdown)

const allowedTipCaptions = mdListArrayConverter(tipsTricksTriviaDocument).filter((line) => {
  return line.trim().length > 0
})

if (allowedTipCaptions.length === 0) {
  throw new Error('Expected en-US tipsTricksTrivia bullets for Playwright assertions')
}

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  fantasiaMascotImage: 'fantasiaMascotImage-image',
  projectOverview: 'projectOverview',
  projectOverviewProjectName: 'projectOverview-projectName',
  projectOverviewSubtitle: 'projectOverview-subtitle',
  projectOverviewTipCard: 'projectOverview-tipCard',
  projectOverviewTipHeading: 'projectOverview-tipHeading',
  projectOverviewTipMessage: 'projectOverview-tipMessage'
} as const

const defaultActiveProjectSeed: I_faComponentTestingStoreSeed = {
  activeProject: {
    filePath: PLAYWRIGHT_PROJECT_OVERVIEW_FILE,
    id: PLAYWRIGHT_PROJECT_OVERVIEW_ID,
    name: PLAYWRIGHT_PROJECT_OVERVIEW_NAME
  },
  hidePlushes: false,
  hideTooltipsProject: false
}

async function remountProjectOverviewAfterStoreSeed (
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
    await router.replace({ path: '/componentTesting/ProjectOverview' })
  })
  await page.locator(`[data-test-locator="${selectorList.projectOverview}"]`).waitFor({
    state: 'visible',
    timeout: 30_000
  })
  await page.waitForTimeout(faFrontendRenderTimer)
}

test.describe.serial('Project overview (active project, tips card)', () => {
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
    await remountProjectOverviewAfterStoreSeed(appWindow, defaultActiveProjectSeed)
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * ProjectOverview root section is present in the component-testing shell.
   */
  test('Check that the ProjectOverview wrapper is visible', async () => {
    await expect(appWindow.locator(`[data-test-locator="${selectorList.projectOverview}"]`)).toHaveCount(1)
  })

  /**
   * Subtitle uses the en-US project overview for string and is shown on the page.
   */
  test('Check that the project overview subtitle matches en-US copy', async () => {
    const subtitle = appWindow.locator(`[data-test-locator="${selectorList.projectOverviewSubtitle}"]`)
    await expect(subtitle).toBeVisible()
    await expect(subtitle).toHaveText(projectOverviewMessages.projectOverviewFor)
  })

  /**
   * Active project display name from the seeded Pinia session appears in the title row.
   */
  test('Check that the seeded project title is shown', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.projectOverviewProjectName}"]`)
    await expect(title).toBeVisible()
    await expect(title).toHaveText(PLAYWRIGHT_PROJECT_OVERVIEW_NAME)
  })

  /**
   * Tips card mirrors Tips, Tricks and Trivia notify copy: Did you know heading plus a markdown bullet line.
   */
  test('Check that the project overview tips card shows Did you know and a trivia line', async () => {
    test.setTimeout(90_000)
    const tipCard = appWindow.locator(`[data-test-locator="${selectorList.projectOverviewTipCard}"]`)
    await expect(tipCard).toBeVisible()

    const heading = tipCard.locator(`[data-test-locator="${selectorList.projectOverviewTipHeading}"]`)
    await expect(heading).toHaveText(unsortedAppTexts.didYouKnow)

    const tipMessage = tipCard.locator(`[data-test-locator="${selectorList.projectOverviewTipMessage}"]`)
    await expect(tipMessage).not.toBeEmpty()

    await expect.poll(async () => {
      const message = (await tipMessage.innerText()).trim().replace(/^-\s*/, '')
      if (message.length === 0) {
        return false
      }
      return allowedTipCaptions.some((caption) => caption.trim() === message || caption.trim().replace(/^-\s*/, '') === message)
    }, { timeout: 45_000 }).toBe(true)
  })

  /**
   * Default user settings show the Fantasia mascot in the tips card (hidePlushes false).
   */
  test('Check that the tips card shows the mascot image when plushes are enabled', async () => {
    const tipCard = appWindow.locator(`[data-test-locator="${selectorList.projectOverviewTipCard}"]`)
    await expect(tipCard.locator(`[data-test-locator="${selectorList.fantasiaMascotImage}"]`)).toHaveCount(1)
    await expect(tipCard.locator('.projectOverview__hintIcon')).toHaveCount(0)
  })
})

test.describe.serial('Project overview (tips card hidden)', () => {
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
    await remountProjectOverviewAfterStoreSeed(appWindow, {
      ...defaultActiveProjectSeed,
      hideTooltipsProject: true
    })
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * Hide tips on project overview removes the tip card while the project title stays visible.
   */
  test('Check that hideTooltipsProject removes the tips card', async () => {
    await expect(appWindow.locator(`[data-test-locator="${selectorList.projectOverviewTipCard}"]`)).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectOverviewProjectName}"]`)
    ).toHaveText(PLAYWRIGHT_PROJECT_OVERVIEW_NAME)
  })
})

test.describe.serial('Project overview (tips card help icon)', () => {
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
    await remountProjectOverviewAfterStoreSeed(appWindow, {
      ...defaultActiveProjectSeed,
      hidePlushes: true
    })
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * hidePlushes removes the mascot from the tips card with no icon replacement.
   */
  test('Check that hidePlushes omits the mascot from the tips card', async () => {
    const tipCard = appWindow.locator(`[data-test-locator="${selectorList.projectOverviewTipCard}"]`)
    await expect(tipCard).toBeVisible()
    await expect(tipCard.locator(`[data-test-locator="${selectorList.fantasiaMascotImage}"]`)).toHaveCount(0)
    await expect(tipCard.locator('.projectOverview__hintIcon')).toHaveCount(0)
  })
})
