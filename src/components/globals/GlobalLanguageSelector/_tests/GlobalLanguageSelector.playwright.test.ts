import type { ElectronApplication, Locator, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_GlobalLanguageSelectorDe from 'app/i18n/de/components/globals/GlobalLanguageSelector/L_GlobalLanguageSelector'
import L_GlobalLanguageSelectorFr from 'app/i18n/fr/components/globals/GlobalLanguageSelector/L_GlobalLanguageSelector'
import type { T_faUserSettingsLanguageNamesKey } from 'app/types/faUserSettingsLanguageRegistry'

import L_faUserSettingsEnUs from 'app/i18n/en-US/globalFunctionality/L_faUserSettings'
import { GLOBAL_LANGUAGE_SELECTOR_LOCALES } from '../scripts/globalLanguageSelectorLocales'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'GlobalLanguageSelector',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 */
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

/**
 * How long to wait for a flag img to finish loading and pass decode() in Electron/Chromium.
 */
const flagImageLoadTimeoutMs = 15_000

const selectorList = {
  menuPanel: '.globalLanguageSelector__menu',
  root: 'globalLanguageSelector-root',
  spellcheckRefresh: 'globalLanguageSelector-spellcheckRefresh',
  trigger: 'globalLanguageSelector-trigger',
  triggerFlag: 'globalLanguageSelector-trigger-flag'
} as const

/**
 * Asserts the flag img reached a loaded state and decode() succeeds (broken images reject decode).
 */
async function expectFlagImageLoaded (flagLocator: Locator): Promise<void> {
  await expect(async () => {
    const ok = await flagLocator.evaluate(async (el) => {
      if (!(el instanceof HTMLImageElement)) {
        return false
      }

      await new Promise<void>((resolve) => {
        if (el.complete) {
          resolve()
          return
        }
        el.addEventListener('load', () => resolve(), { once: true })
        el.addEventListener('error', () => resolve(), { once: true })
      })

      const decodedOk = await el.decode().then(
        (): true => true,
        (): false => false
      )
      return decodedOk
    })
    expect(ok).toBe(true)
  }).toPass({ timeout: flagImageLoadTimeoutMs })
}

function languageNameForMenuKey (key: T_faUserSettingsLanguageNamesKey): string {
  return L_faUserSettingsEnUs.languageNames[key]
}

/**
 * Ensures the language menu is open (clicks trigger only when the panel is hidden).
 */
async function openLanguageMenu (page: Page): Promise<void> {
  const menu = page.locator(selectorList.menuPanel)
  if (!(await menu.isVisible())) {
    await page.locator(`[data-test-locator="${selectorList.trigger}"]`).click()
  }
  await expect(menu).toBeVisible()
}

test.describe.serial('Global language selector', () => {
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
   * Default locale is en-US; trigger shows the US flag asset path from the locale feed.
   */
  test('Trigger shows US flag and en-US hooks on load', async () => {
    const root = appWindow.locator(`[data-test-locator="${selectorList.root}"]`)
    await expect(root).toHaveCount(1)
    await expect(root).toHaveAttribute('data-test-active-language-code', 'en-US')
    await expect(root).toHaveAttribute('data-test-i18n-locale', 'en-US')

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.spellcheckRefresh}"]`)
    ).toBeHidden()

    const triggerFlag = appWindow.locator(`[data-test-locator="${selectorList.triggerFlag}"]`)
    await expect(triggerFlag).toHaveAttribute('data-test-expected-flag-path', '/countryFlags/us.svg')
    const src = await triggerFlag.getAttribute('src')
    expect(src ?? '').toMatch(/us\.svg(\?|$|#)/)
    await expectFlagImageLoaded(triggerFlag)
  })

  /**
   * Open menu: each row matches GLOBAL_LANGUAGE_SELECTOR_LOCALES flag path and en-US label strings.
   */
  test('Menu lists paired flag paths and language labels from the feed', async () => {
    await openLanguageMenu(appWindow)

    for (const row of GLOBAL_LANGUAGE_SELECTOR_LOCALES) {
      const option = appWindow.locator(`[data-test-locator="globalLanguageSelector-option-${row.code}"]`)
      await expect(option).toHaveCount(1)

      const flagImg = appWindow.locator(`[data-test-locator="globalLanguageSelector-menu-flag-${row.code}"]`)
      await expect(flagImg).toHaveAttribute('data-test-expected-flag-path', row.flagSrc)
      const src = await flagImg.getAttribute('src')
      const file = row.flagSrc.replace('/countryFlags/', '')
      expect(src ?? '').toMatch(new RegExp(`${file.replace('.', '\\.')}($|\\?|#)`))

      const expectedLabel = languageNameForMenuKey(row.languageNamesKey)
      await expect(option.locator('.globalLanguageSelector__menuItemLabel')).toHaveText(expectedLabel)

      const alt = await flagImg.getAttribute('alt')
      expect(alt).toBe(expectedLabel)

      await expectFlagImageLoaded(flagImg)
    }
  })

  /**
   * Choosing Deutsch updates trigger flag, Pinia language code, and vue-i18n locale.
   */
  test('Selecting German updates trigger flag and i18n locale to de', async () => {
    await openLanguageMenu(appWindow)
    await appWindow.locator('[data-test-locator="globalLanguageSelector-option-de"]').click()

    const root = appWindow.locator(`[data-test-locator="${selectorList.root}"]`)
    await expect(root).toHaveAttribute('data-test-active-language-code', 'de', { timeout: 15_000 })
    await expect(root).toHaveAttribute('data-test-i18n-locale', 'de', { timeout: 15_000 })

    const triggerFlag = appWindow.locator(`[data-test-locator="${selectorList.triggerFlag}"]`)
    await expect(triggerFlag).toHaveAttribute('data-test-expected-flag-path', '/countryFlags/de.svg', {
      timeout: 15_000
    })
    const src = await triggerFlag.getAttribute('src')
    expect(src ?? '').toMatch(/de\.svg(\?|$|#)/)
    await expectFlagImageLoaded(triggerFlag)

    const refreshBtn = appWindow.locator(`[data-test-locator="${selectorList.spellcheckRefresh}"]`)
    await expect(refreshBtn).toBeVisible({ timeout: 15_000 })
  })

  /**
   * Spellcheck reload control hides after use; persisted language stays **de**. After reload, a further
   * language change shows the refresh hint again with vue-i18n copy for that locale (data-test-tooltip-text).
   */
  test('Spellcheck refresh reloads and keeps German as the active language', async () => {
    const refreshBtn = appWindow.locator(`[data-test-locator="${selectorList.spellcheckRefresh}"]`)
    await expect(refreshBtn).toBeVisible({ timeout: 15_000 })
    await expect(refreshBtn).toHaveAttribute(
      'data-test-tooltip-text',
      L_GlobalLanguageSelectorDe.spellcheckRefreshTooltip
    )

    await refreshBtn.click()
    await appWindow.waitForTimeout(faFrontendRenderTimer)

    const root = appWindow.locator(`[data-test-locator="${selectorList.root}"]`)
    await expect(root).toHaveAttribute('data-test-active-language-code', 'de', { timeout: 15_000 })
    await expect(refreshBtn).toBeHidden({ timeout: 15_000 })

    await openLanguageMenu(appWindow)
    await appWindow.locator('[data-test-locator="globalLanguageSelector-option-fr"]').click()
    await expect(root).toHaveAttribute('data-test-active-language-code', 'fr', { timeout: 15_000 })
    await expect(root).toHaveAttribute('data-test-i18n-locale', 'fr', { timeout: 15_000 })

    await expect(refreshBtn).toBeVisible({ timeout: 15_000 })
    await expect(refreshBtn).toHaveAttribute(
      'data-test-tooltip-text',
      L_GlobalLanguageSelectorFr.spellcheckRefreshTooltip
    )
  })
})
