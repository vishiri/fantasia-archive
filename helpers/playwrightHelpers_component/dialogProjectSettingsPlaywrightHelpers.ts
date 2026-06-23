import { expect, type Locator, type Page } from '@playwright/test'

import { FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES } from 'app/i18n/faUserSettingsLanguageDisplayNames'
import L_projectSettings from 'app/i18n/en-US/dialogs/L_projectSettings'
import L_FaLocaleTranslationsInput from 'app/i18n/en-US/components/elements/FaLocaleTranslationsInput/L_FaLocaleTranslationsInput'
import {
  faUserSettingsLanguageCodeToNamesKey,
  type T_faUserSettingsLanguageCode
} from 'app/types/faUserSettingsLanguageRegistry'

const saveButtonLocator = 'dialogProjectSettings-button-save'
const saveWithoutClosingLocator = 'dialogProjectSettings-button-saveWithoutClosing'
const saveErrorsIconLocator = 'dialogProjectSettings-saveErrorsIcon'

/**
 * Asserts both save actions are disabled and the save-errors icon shows the expected flat tooltip.
 */
export async function assertSaveDisabledWithTooltip (
  page: Page,
  expectedFlatText: string
): Promise<void> {
  await expect(
    page.locator(`[data-test-locator="${saveButtonLocator}"]`)
  ).toBeDisabled()
  await expect(
    page.locator(`[data-test-locator="${saveWithoutClosingLocator}"]`)
  ).toBeDisabled()
  await expect(
    page.locator(`[data-test-locator="${saveErrorsIconLocator}"]`)
  ).toHaveAttribute('data-test-tooltip-text', expectedFlatText)
}

/**
 * Asserts both save actions are enabled and the save-errors icon is absent.
 */
export async function assertSaveEnabledWithoutErrorsIcon (page: Page): Promise<void> {
  await expect(
    page.locator(`[data-test-locator="${saveButtonLocator}"]`)
  ).toBeEnabled()
  await expect(
    page.locator(`[data-test-locator="${saveErrorsIconLocator}"]`)
  ).toHaveCount(0)
}

/**
 * Fills a vertical tab strip filter input by data-test-locator id.
 */
export async function fillVerticalTabFilter (
  page: Page,
  inputLocator: string,
  query: string
): Promise<void> {
  const input = page.locator(`[data-test-locator="${inputLocator}"]`)
  await input.fill(query)
}

/**
 * Clears a vertical tab strip filter via its clear button.
 */
export async function clearVerticalTabFilter (
  page: Page,
  clearLocator: string
): Promise<void> {
  await page.locator(`[data-test-locator="${clearLocator}"]`).click()
}

/**
 * Counts visible tab rows for a tab item locator.
 */
export async function countVisibleTabs (page: Page, tabLocator: string): Promise<number> {
  return page.locator(`[data-test-locator="${tabLocator}"]`).count()
}

/**
 * Opens the FaLocaleTranslationsInput locale menu for a field or menuPanel prefix.
 */
export async function openFaLocaleTranslationsMenu (
  page: Page,
  testLocatorPrefix: string
): Promise<void> {
  await expect(async () => {
    const translationsButton = page.locator(
      `[data-test-locator="${testLocatorPrefix}-translationsButton"]`
    )
    if (await translationsButton.count() > 0) {
      await translationsButton.click({ force: true })
    } else {
      await page.locator(`[data-test-locator="${testLocatorPrefix}"]`).click({ force: true })
    }
    const menu = page.locator(`[data-test-locator="${testLocatorPrefix}-translationsMenu"]`)
    if (await menu.count() > 0) {
      await expect(menu).toBeVisible()
    } else {
      await expect(
        page.locator(`[data-test-locator="${testLocatorPrefix}-translationsInput-en-US"]`)
      ).toBeVisible()
    }
  }).toPass({ timeout: 10_000 })
}

function resolveLocaleDisplayName (localeCode: string): string {
  const namesKey = faUserSettingsLanguageCodeToNamesKey(localeCode as T_faUserSettingsLanguageCode)
  return FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES[namesKey]
}

/**
 * Builds the FaLocaleTranslationsInput fallback warning tooltip for a fallback locale code.
 */
export function buildFaLocaleTranslationsFallbackWarningTooltip (
  fallbackLanguageCode: string
): string {
  const fallbackLanguageName = resolveLocaleDisplayName(fallbackLanguageCode)
  return L_FaLocaleTranslationsInput.fallbackWarningTooltip.replace(
    '{fallbackLanguageName}',
    fallbackLanguageName
  )
}

/**
 * Sets a single-locale translation value inside an open translations menu.
 */
export async function setLocaleTranslation (
  page: Page,
  testLocatorPrefix: string,
  localeCode: string,
  text: string
): Promise<void> {
  const displayName = resolveLocaleDisplayName(localeCode)
  const menu = page.locator(`[data-test-locator="${testLocatorPrefix}-translationsMenu"]`)
  await expect(async () => {
    if (await menu.isVisible()) {
      const field = menu.locator(`[data-test-locale-code="${localeCode}"]`).locator('input, textarea').first()
      await expect(field).toBeVisible()
      await field.fill(text)
      return
    }
    const pinnedInput = page.locator(
      `[data-test-locator="${testLocatorPrefix}-translationsInput-${localeCode}"]`
    ).locator('input, textarea').first()
    if (await pinnedInput.count() > 0 && await pinnedInput.isVisible()) {
      await pinnedInput.fill(text)
      return
    }
    const byLabel = page.getByRole('textbox', {
      exact: true,
      name: displayName
    })
    if (await byLabel.count() > 0 && await byLabel.first().isVisible()) {
      await byLabel.first().fill(text)
      return
    }
    const field = page.locator(
      `[data-test-locator="${testLocatorPrefix}-translationsRow"][data-test-locale-code="${localeCode}"]`
    ).locator('input, textarea').first()
    await expect(field).toBeVisible()
    await field.fill(text)
  }).toPass({ timeout: 10_000 })
}

/**
 * Sets singular and/or plural translation inputs for one locale.
 */
export async function setSingularPluralTranslation (
  page: Page,
  testLocatorPrefix: string,
  localeCode: string,
  values: { singular?: string, plural?: string }
): Promise<void> {
  const displayName = resolveLocaleDisplayName(localeCode)
  const menu = page.locator(`[data-test-locator="${testLocatorPrefix}-translationsMenu"]`)
  await expect(async () => {
    if (await menu.isVisible()) {
      const row = menu.locator(`[data-test-locale-code="${localeCode}"]`)
      if (values.singular !== undefined) {
        const singularInput = row.locator(
          `[data-test-locator="${testLocatorPrefix}-translationsSingularInput-${localeCode}"]`
        ).locator('input, textarea').first()
        if (await singularInput.count() > 0) {
          await expect(singularInput).toBeVisible()
          await singularInput.fill(values.singular)
        } else {
          const textboxes = row.getByRole('textbox', {
            exact: true,
            name: displayName
          })
          await expect(textboxes.nth(0)).toBeVisible()
          await textboxes.nth(0).fill(values.singular)
        }
      }
      if (values.plural !== undefined) {
        const pluralInput = row.locator(
          `[data-test-locator="${testLocatorPrefix}-translationsPluralInput-${localeCode}"]`
        ).locator('input, textarea').first()
        if (await pluralInput.count() > 0) {
          await expect(pluralInput).toBeVisible()
          await pluralInput.fill(values.plural)
        } else {
          const textboxes = row.getByRole('textbox', {
            exact: true,
            name: displayName
          })
          await expect(textboxes.nth(1)).toBeVisible()
          await textboxes.nth(1).fill(values.plural)
        }
      }
      return
    }
    const textboxes = page.getByRole('textbox', {
      exact: true,
      name: displayName
    })
    const textboxCount = await textboxes.count()
    if (textboxCount >= 2) {
      if (values.singular !== undefined) {
        await textboxes.nth(0).fill(values.singular)
      }
      if (values.plural !== undefined) {
        await textboxes.nth(1).fill(values.plural)
      }
      return
    }
    const row = page.locator(
      `[data-test-locator="${testLocatorPrefix}-translationsRow"][data-test-locale-code="${localeCode}"]`
    )
    if (values.singular !== undefined) {
      const singularInput = row.locator(
        `[data-test-locator="${testLocatorPrefix}-translationsSingularInput-${localeCode}"]`
      ).locator('input, textarea').first()
      await expect(singularInput).toBeVisible()
      await singularInput.fill(values.singular)
    }
    if (values.plural !== undefined) {
      const pluralInput = row.locator(
        `[data-test-locator="${testLocatorPrefix}-translationsPluralInput-${localeCode}"]`
      ).locator('input, textarea').first()
      await expect(pluralInput).toBeVisible()
      await pluralInput.fill(values.plural)
    }
  }).toPass({ timeout: 10_000 })
}

/**
 * Builds the expected singular/plural missing-translation tooltip for en-US UI.
 */
export function buildSingularPluralMissingTooltip (params: {
  fallbackLanguageCode: string | null
  missingForm: 'both' | 'plural' | 'singular'
}): string {
  const sp = L_projectSettings.singularPluralMissing
  const lines: string[] = []
  if (params.missingForm === 'both') {
    lines.push(sp.bothIntro)
    lines.push(`- ${sp.singularBullet}`)
    lines.push(`- ${sp.pluralBullet}`)
  } else if (params.missingForm === 'plural') {
    lines.push(sp.bothIntro)
    lines.push(`- ${sp.pluralBullet}`)
  } else {
    lines.push(sp.bothIntro)
    lines.push(`- ${sp.singularBullet}`)
  }
  if (params.fallbackLanguageCode !== null) {
    const fallbackLanguageName = params.fallbackLanguageCode === 'de'
      ? FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES.de
      : FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES.enUS
    lines.push(
      sp.usingFallback.replace('{fallbackLanguageName}', fallbackLanguageName)
    )
  }
  return lines.join('\n')
}

/**
 * Asserts a warning icon exposes the expected data-test-tooltip-text value.
 */
export async function assertWarningTooltip (
  locator: Locator,
  expectedTooltip: string
): Promise<void> {
  await expect(locator).toHaveCount(1)
  await expect(locator).toHaveAttribute('data-test-tooltip-text', expectedTooltip)
}
