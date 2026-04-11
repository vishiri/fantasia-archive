import { _electron as electron } from 'playwright'
import type { ElectronApplication, Locator, Page } from 'playwright'
import { test, expect } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  FA_ELECTRON_MAIN_JS_PATH,
  FA_FRONTEND_RENDER_TIMER
} from 'app/helpers/playwrightHelpers/faPlaywrightElectronLaunchConstants'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
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
 * Electron main filepath
 */
const electronMainFilePath: string = FA_ELECTRON_MAIN_JS_PATH

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

      try {
        await el.decode()
        return true
      } catch {
        return false
      }
    })
    expect(ok).toBe(true)
  }).toPass({ timeout: flagImageLoadTimeoutMs })
}

function languageNameForMenuKey (key: 'de' | 'enUS' | 'fr'): string {
  const names = L_faUserSettingsEnUs.languageNames
  if (key === 'enUS') {
    return names.enUS
  }
  if (key === 'de') {
    return names.de
  }
  return names.fr
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
    resetFaPlaywrightIsolatedUserData()
    electronApp = await electron.launch({
      env: extraEnvSettings,
      args: [electronMainFilePath],
      ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
    })
    appWindow = await electronApp.firstWindow()
    await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
    await appWindow.waitForTimeout(faFrontendRenderTimer)
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await closeFaElectronAppWithRecordedVideoAttachments(electronApp, suiteTestInfo, afterAllTestInfo)
  })

  /**
   * Default locale is en-US; trigger shows the US flag asset path from the locale feed.
   */
  test('Trigger shows US flag and en-US hooks on load', async () => {
    const root = appWindow.locator(`[data-test-locator="${selectorList.root}"]`)
    await expect(root).toHaveCount(1)
    await expect(root).toHaveAttribute('data-test-active-language-code', 'en-US')
    await expect(root).toHaveAttribute('data-test-i18n-locale', 'en-US')

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
  })
})
