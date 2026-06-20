import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import { APP_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogAppSettings/_data/appSettingsOptions'

import appSettingsMessages from 'app/i18n/en-US/dialogs/L_appSettings'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

import { buildExpectedAppSettingsTreeFromEnUsMessages } from './DialogAppSettings.playwright.expectations'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogAppSettings',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Buffer so the component-testing shell finishes rendering before assertions.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer:number = FA_FRONTEND_RENDER_TIMER

/**
 * q-tooltip open delay on the help icon is 500ms; allow extra slack for Electron, dialog layout, and tab-panel paint.
 */
const appSettingsTooltipOpenDelayMs = 1400

/**
 * Timeout for the single live q-tooltip visibility check (first setting row only).
 */
const appSettingsTooltipVisibleTimeoutMs = 15_000

/**
 * Playwright hooks: stable data-test-locator ids, data-test-tooltip-text and data-test-setting-id attribute names, and rare full locator strings (quasarTooltip for portaled Quasar tooltips without data-test hooks on the overlay).
 */
const selectorList = {
  categoryTitle: 'dialogAppSettings-categoryTitle',
  closeButton: 'dialogAppSettings-button-close',
  dialogAppSettingsRootClass: 'dialogAppSettings',
  quasarTooltip: '[role="tooltip"]',
  saveButton: 'dialogAppSettings-button-save',
  settingHelpTooltipTextHook: 'data-test-tooltip-text',
  settingIdAttribute: 'data-test-setting-id',
  settingLabel: 'dialogAppSettings-settingLabel',
  settingNote: 'dialogAppSettings-settingNote',
  subcategoryTitle: 'dialogAppSettings-subcategoryTitle',
  title: 'dialogAppSettings-title'
}

/**
 * Dynamic data-test-locator values for tabs, category blocks, subcategory rows, and setting cards.
 */
const appSettingsSelector = {
  category: (categoryKey: string) => `dialogAppSettings-category-${categoryKey}`,
  setting: (settingKey: string) => `dialogAppSettings-setting-${settingKey}`,
  subcategory: (categoryKey: string, subCategoryKey: string) =>
    `dialogAppSettings-subcategory-${categoryKey}-${subCategoryKey}`,
  tab: (categoryKey: string) => `dialogAppSettings-tab-${categoryKey}`
} as const

/**
 * data-test-locator roots for the global search overlay (distinct from per-tab panel locators).
 */
const appSettingsSearchSelector = {
  setting: (settingKey: string) => `dialogAppSettings-search-setting-${settingKey}`
} as const

/**
 * Keys rendered in App settings (APP_SETTINGS_OPTIONS); dialog rows must expose exactly this set on data-test-setting-id. Persisted I_faUserSettings may include additional keys such as languageCode that the dialog does not list.
 */
const expectedFaUserSettingKeysSorted = (
  Object.keys(APP_SETTINGS_OPTIONS) as (keyof typeof APP_SETTINGS_OPTIONS)[]
).slice().sort((keyA, keyB) => String(keyA).localeCompare(String(keyB)))

const appSettingsDirectInput: T_dialogName = 'AppSettings'

/**
 * q-input debounce is 300ms; allow slack for Electron paint after the model updates.
 */
const appSettingsSearchDebounceWaitMs = 400

const expectedAppSettingsSearchNoResultsTitle = appSettingsMessages.searchNoResultsTitle
const expectedAppSettingsSearchNoResultsDescription =
  appSettingsMessages.searchNoResultsDescription

/**
 * Types into the header settings search field and waits for the debounced filter to apply.
 */
const fillAppSettingsSearch = async (page: Page, query: string): Promise<void> => {
  const searchInput = page.locator('.dialogAppSettings__settingsSearchWrapper input').first()
  await searchInput.click()
  await searchInput.fill(query)
  await page.waitForTimeout(appSettingsSearchDebounceWaitMs)
}

/**
 * Clears the settings search field and waits for the normal tab panels to return.
 */
const clearAppSettingsSearch = async (page: Page): Promise<void> => {
  await fillAppSettingsSearch(page, '')
}

/**
 * One Electron session: chrome, copy walk, and settings search run while the dialog stays open; the close test runs last so earlier tests still see an open dialog.
 */
test.describe.serial('App settings dialog', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: appSettingsDirectInput })
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
   * Feed "AppSettings" input and check if key dialog chrome opens.
   */
  test('Open test "AppSettings" dialog with title and actions', async () => {
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)

    await expect(closeButton).toHaveCount(1)
    await expect(title).toHaveCount(1)
  })

  /**
   * App settings copy matches en-US dialogs.appSettings (via buildExpectedAppSettingsTreeFromEnUsMessages).
   * - Visits every vertical tab, category, subcategory, and setting row.
   * - Asserts titles, optional notes, tags, and help copy duplicated on data-test-tooltip-text.
   * - Hovers the first help icon once and asserts the live overlay with selectorList.quasarTooltip (retries hover + dismiss with expect().toPass because Quasar portaled tooltips are timing-sensitive under Electron); other rows skip hover.
   * - After each tab switch, unions data-test-setting-id from the active panel so the combined set matches APP_SETTINGS_OPTIONS keys exactly (Quasar mounts one panel at a time here).
   * - globalFunctionality.faUserSettings only covers save toasts, not these labels.
   */
  test('App settings dialog matches en-US category, subcategory, and setting copy on every tab', async () => {
    test.setTimeout(120_000)

    const expectedTree = buildExpectedAppSettingsTreeFromEnUsMessages()

    const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    await expect(title).toHaveCount(1)

    const dialogRoot = appWindow.locator(`.${selectorList.dialogAppSettingsRootClass}`)

    /**
     * Flag to track if the first setting tooltip has been verified via hover
     */
    let verifiedFirstSettingTooltipViaHover = false

    const settingIdsSeenAcrossTabs = new Set<string>()

    for (const categoryKey of Object.keys(expectedTree)) {
      const category = expectedTree[categoryKey]
      const tab = appWindow.locator(`[data-test-locator="${appSettingsSelector.tab(categoryKey)}"]`)
      await expect(tab).toHaveCount(1)
      await tab.click()
      await appWindow.waitForTimeout(550)

      const batchIdsRaw = await dialogRoot.locator(`[${selectorList.settingIdAttribute}]`).evaluateAll(
        (elements: HTMLElement[], attributeName: string) =>
          elements.map((element) => element.getAttribute(attributeName)),
        selectorList.settingIdAttribute
      )
      for (const rawId of batchIdsRaw) {
        if (rawId !== null && rawId !== '') {
          settingIdsSeenAcrossTabs.add(rawId)
        }
      }

      const categorySection = appWindow.locator(
        `[data-test-locator="${appSettingsSelector.category(categoryKey)}"]`
      )
      await expect(categorySection).toBeVisible()
      await expect(
        categorySection.locator(`[data-test-locator="${selectorList.categoryTitle}"]`)
      ).toHaveText(category.title)

      for (const [subCategoryKey, subCategory] of Object.entries(category.subCategories)) {
        const subSection = categorySection.locator(
          `[data-test-locator="${appSettingsSelector.subcategory(categoryKey, subCategoryKey)}"]`
        )
        await expect(
          subSection.locator(`[data-test-locator="${selectorList.subcategoryTitle}"]`)
        ).toHaveText(subCategory.title)

        for (const [settingKey, setting] of Object.entries(subCategory.settingsList)) {
          const settingRoot = appWindow.locator(
            `[data-test-locator="${appSettingsSelector.setting(settingKey)}"]`
          )
          await expect(settingRoot).toHaveCount(1)
          await expect(settingRoot).toHaveAttribute(selectorList.settingIdAttribute, settingKey)
          await expect(settingRoot).toHaveAttribute('data-test-tags', setting.tags)
          await expect(
            settingRoot.locator(`[data-test-locator="${selectorList.settingLabel}"]`)
          ).toHaveText(setting.title)

          if (setting.note !== undefined && setting.note !== '') {
            await expect(
              settingRoot.locator(`[data-test-locator="${selectorList.settingNote}"]`)
            ).toHaveText(setting.note)
          } else {
            await expect(
              settingRoot.locator(`[data-test-locator="${selectorList.settingNote}"]`)
            ).toHaveCount(0)
          }

          const helpIcon = settingRoot.locator(`[${selectorList.settingHelpTooltipTextHook}]`)
          await expect(helpIcon).toHaveCount(1)
          await expect(helpIcon).toHaveAttribute(
            selectorList.settingHelpTooltipTextHook,
            setting.description
          )

          if (!verifiedFirstSettingTooltipViaHover) {
            verifiedFirstSettingTooltipViaHover = true
            await expect(async () => {
              await appWindow.mouse.move(12, 12)
              await appWindow.waitForTimeout(280)
              await helpIcon.scrollIntoViewIfNeeded()
              await helpIcon.hover({
                force: true,
                timeout: 10_000
              })
              await appWindow.waitForTimeout(appSettingsTooltipOpenDelayMs)
              const liveTooltip = appWindow
                .locator(selectorList.quasarTooltip)
                .filter({ hasText: setting.description })
                .last()
              await expect(liveTooltip).toBeVisible({
                timeout: 4000
              })
              await expect(liveTooltip).toHaveText(setting.description)
            }).toPass({
              timeout: appSettingsTooltipVisibleTimeoutMs
            })
          }

          await categorySection.locator(`[data-test-locator="${selectorList.categoryTitle}"]`).hover({
            force: true
          })
          await appWindow.waitForTimeout(200)
        }
      }
    }

    expect(settingIdsSeenAcrossTabs.size).toBe(expectedFaUserSettingKeysSorted.length)
    const settingIdsSeenSorted = [...settingIdsSeenAcrossTabs].sort((keyA, keyB) =>
      keyA.localeCompare(keyB)
    )
    expect(settingIdsSeenSorted).toEqual(
      expectedFaUserSettingKeysSorted.map((key) => String(key))
    )
  })

  /**
   * Settings search overlay: title, tag, and setting-description substrings; empty state ErrorCard. Clearing the query restores tab interaction before the suite closes the dialog.
   */
  test('App settings search finds Hide project name in tree by title match', async () => {
    const searchPanel = appWindow.locator('[data-test-locator="dialogAppSettings-searchAllSettingsPanel"]')
    await expect(searchPanel).toHaveCount(0)

    await fillAppSettingsSearch(appWindow, 'Hide project name in tree')

    await expect(searchPanel).toHaveCount(1)
    await expect(searchPanel).toBeVisible()

    const matchRoots = appWindow.locator('[data-test-locator^="dialogAppSettings-search-setting-"]')
    await expect(matchRoots).toHaveCount(1)

    const projectNameRow = appWindow.locator(
      `[data-test-locator="${appSettingsSearchSelector.setting('noProjectName')}"]`
    )
    await expect(projectNameRow).toBeVisible()
    await expect(projectNameRow).toHaveAttribute('data-test-setting-id', 'noProjectName')

    await expect(
      appWindow.locator('[data-test-locator="dialogAppSettings-searchNoResults"]')
    ).toBeHidden()

    await clearAppSettingsSearch(appWindow)
    await expect(searchPanel).toHaveCount(0)
  })

  test('App settings search finds dark mode by tag substring theme', async () => {
    await fillAppSettingsSearch(appWindow, 'theme')

    const matchRoots = appWindow.locator('[data-test-locator^="dialogAppSettings-search-setting-"]')
    await expect(matchRoots).toHaveCount(1)

    const darkModeRow = appWindow.locator(
      `[data-test-locator="${appSettingsSearchSelector.setting('darkMode')}"]`
    )
    await expect(darkModeRow).toBeVisible()
    await expect(darkModeRow).toHaveAttribute('data-test-setting-id', 'darkMode')
    await expect(darkModeRow).toHaveAttribute('data-test-tags', /theme/)

    await clearAppSettingsSearch(appWindow)
  })

  test('App settings search finds hide empty fields by description substring hides fields', async () => {
    await fillAppSettingsSearch(appWindow, 'hides fields')

    const matchRoots = appWindow.locator('[data-test-locator^="dialogAppSettings-search-setting-"]')
    await expect(matchRoots).toHaveCount(1)

    const hideEmptyFieldsRow = appWindow.locator(
      `[data-test-locator="${appSettingsSearchSelector.setting('hideEmptyFields')}"]`
    )
    await expect(hideEmptyFieldsRow).toBeVisible()
    await expect(hideEmptyFieldsRow).toHaveAttribute('data-test-setting-id', 'hideEmptyFields')

    await clearAppSettingsSearch(appWindow)
  })

  test('App settings search shows reading ErrorCard when query matches nothing', async () => {
    await fillAppSettingsSearch(appWindow, 'no-exist-text-test')

    const noResults = appWindow.locator('[data-test-locator="dialogAppSettings-searchNoResults"]')
    await expect(noResults).toBeVisible()

    const errorCard = appWindow.locator('[data-test-locator="errorCard"]')
    await expect(errorCard).toBeVisible()
    await expect(errorCard).toHaveAttribute('data-test-error-card-width', '650')

    const mascot = appWindow.locator('[data-test-locator="fantasiaMascotImage-image"]')
    await expect(mascot).toHaveCount(1)
    await expect(mascot).toHaveAttribute('data-test-image', 'reading')

    const titleLine = errorCard.locator('[data-test-locator="errorCard-title"]')
    await expect(titleLine).toHaveCount(1)
    await expect(titleLine).toHaveText(expectedAppSettingsSearchNoResultsTitle)

    const detailsLine = errorCard.locator('[data-test-locator="errorCard-details"]')
    await expect(detailsLine).toHaveCount(1)
    await expect(detailsLine).toHaveText(expectedAppSettingsSearchNoResultsDescription)

    await clearAppSettingsSearch(appWindow)
  })

  /**
   * Feed "AppSettings" input and check if dialog closes after Close click.
   */
  test('Open test "AppSettings" dialog and close it', async () => {
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)

    await expect(title).toHaveCount(1)
    await expect(closeButton).toHaveCount(1)
    await closeButton.click()

    await appWindow.waitForTimeout(1500)

    expect(await title.isHidden()).toBe(true)
  })
})

const developerSettingsCategoryKey = 'developerSettings'
const logFullActivityPayloadSettingKey = 'logFullActivityPayload'
const showDocumentIDSettingKey = 'showDocumentID'
const postSaveSettingsWaitMs = 500
const tabSwitchSettleMs = 550

/**
 * showDocumentID
 * - Opens Developer Settings, asserts the toggle is off, turns it on, saves, waits, then reads persisted value through faUserSettings.getSettings() in the renderer.
 */
test.describe.serial('App settings showDocumentID persists after Save', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: appSettingsDirectInput })
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

  test('showDocumentID persists after Save; getSettings returns true over the IPC bridge', async () => {
    const devTab = appWindow.locator(
      `[data-test-locator="${appSettingsSelector.tab(developerSettingsCategoryKey)}"]`
    )
    await expect(devTab).toHaveCount(1)
    await devTab.click()
    await appWindow.waitForTimeout(tabSwitchSettleMs)

    const settingRoot = appWindow.locator(
      `[data-test-locator="${appSettingsSelector.setting(showDocumentIDSettingKey)}"]`
    )
    await expect(settingRoot).toHaveCount(1)
    await expect(settingRoot).toHaveAttribute(
      selectorList.settingIdAttribute,
      showDocumentIDSettingKey
    )

    const toggle = settingRoot.getByRole('switch')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')

    const saveButton = appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    await expect(saveButton).toHaveCount(1)
    await saveButton.click()

    await appWindow.waitForTimeout(postSaveSettingsWaitMs)

    const settings = await appWindow.evaluate(async () => {
      return await window.faContentBridgeAPIs.faUserSettings.getSettings()
    })
    expect(settings.showDocumentID).toBe(true)
  })
})

/**
 * showDocumentID
 * - After resetFaPlaywrightIsolatedUserData before launch, Developer Settings toggle must match defaults (off).
 */
test.describe.serial('App settings showDocumentID defaults on fresh userData', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: appSettingsDirectInput })
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

  test('showDocumentID toggle is off on a fresh profile after Playwright userData reset', async () => {
    const devTab = appWindow.locator(
      `[data-test-locator="${appSettingsSelector.tab(developerSettingsCategoryKey)}"]`
    )
    await expect(devTab).toHaveCount(1)
    await devTab.click()
    await appWindow.waitForTimeout(tabSwitchSettleMs)

    const settingRoot = appWindow.locator(
      `[data-test-locator="${appSettingsSelector.setting(showDocumentIDSettingKey)}"]`
    )
    await expect(settingRoot).toHaveCount(1)

    const toggle = settingRoot.getByRole('switch')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
  })
})

/**
 * logFullActivityPayload
 * - Developer Settings subgroup lists the toggle defaulting off; Save persists enabled state through faUserSettings.
 */
test.describe.serial('App settings logFullActivityPayload persists after Save', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: appSettingsDirectInput })
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

  test('logFullActivityPayload defaults off then persists true after Save', async () => {
    const devTab = appWindow.locator(
      `[data-test-locator="${appSettingsSelector.tab(developerSettingsCategoryKey)}"]`
    )
    await expect(devTab).toHaveCount(1)
    await devTab.click()
    await appWindow.waitForTimeout(tabSwitchSettleMs)

    const subcategoryTitle = appWindow.locator(
      `[data-test-locator="${appSettingsSelector.subcategory(developerSettingsCategoryKey, 'documentBody')}"] [data-test-locator="${selectorList.subcategoryTitle}"]`
    )
    await expect(subcategoryTitle).toHaveText(
      appSettingsMessages.appOptionsCategories.developerSettings.documentBody.subtitle
    )

    const settingRoot = appWindow.locator(
      `[data-test-locator="${appSettingsSelector.setting(logFullActivityPayloadSettingKey)}"]`
    )
    await expect(settingRoot).toHaveCount(1)
    await expect(settingRoot).toHaveAttribute(
      selectorList.settingIdAttribute,
      logFullActivityPayloadSettingKey
    )

    const toggle = settingRoot.getByRole('switch')
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')

    const saveButton = appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    await saveButton.click()
    await appWindow.waitForTimeout(postSaveSettingsWaitMs)

    const settings = await appWindow.evaluate(async () => {
      return await window.faContentBridgeAPIs.faUserSettings.getSettings()
    })
    expect(settings.logFullActivityPayload).toBe(true)
  })
})
