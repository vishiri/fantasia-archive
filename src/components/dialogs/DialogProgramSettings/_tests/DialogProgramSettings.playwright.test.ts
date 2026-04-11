import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
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
import { PROGRAM_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogProgramSettings/_data/programSettingsOptions'
import type { T_dialogName } from 'app/types/T_dialogList'

import { buildExpectedProgramSettingsTreeFromEnUsMessages } from './DialogProgramSettings.playwright.expectations'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import programSettingsMessages from 'app/i18n/en-US/dialogs/L_programSettings'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogProgramSettings',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Electron main filepath
 */
const electronMainFilePath:string = FA_ELECTRON_MAIN_JS_PATH

/**
 * Buffer so the component-testing shell finishes rendering before assertions.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer:number = FA_FRONTEND_RENDER_TIMER

/**
 * q-tooltip open delay on the help icon is 500ms; allow extra slack for Electron, dialog layout, and tab-panel paint.
 */
const programSettingsTooltipOpenDelayMs = 1400

/**
 * Timeout for the single live q-tooltip visibility check (first setting row only).
 */
const programSettingsTooltipVisibleTimeoutMs = 15_000

/**
 * Playwright hooks: stable data-test-locator ids, data-test-tooltip-text and data-test-setting-id attribute names, and rare full locator strings (quasarTooltip for portaled Quasar tooltips without data-test hooks on the overlay).
 */
const selectorList = {
  categoryTitle: 'dialogProgramSettings-categoryTitle',
  closeButton: 'dialogProgramSettings-button-close',
  dialogProgramSettingsRootClass: 'dialogProgramSettings',
  quasarTooltip: '[role="tooltip"]',
  saveButton: 'dialogProgramSettings-button-save',
  settingHelpTooltipTextHook: 'data-test-tooltip-text',
  settingIdAttribute: 'data-test-setting-id',
  settingLabel: 'dialogProgramSettings-settingLabel',
  settingNote: 'dialogProgramSettings-settingNote',
  subcategoryTitle: 'dialogProgramSettings-subcategoryTitle',
  title: 'dialogProgramSettings-title'
}

/**
 * Dynamic data-test-locator values for tabs, category blocks, subcategory rows, and setting cards.
 */
const programSettingsSelector = {
  category: (categoryKey: string) => `dialogProgramSettings-category-${categoryKey}`,
  setting: (settingKey: string) => `dialogProgramSettings-setting-${settingKey}`,
  subcategory: (categoryKey: string, subCategoryKey: string) =>
    `dialogProgramSettings-subcategory-${categoryKey}-${subCategoryKey}`,
  tab: (categoryKey: string) => `dialogProgramSettings-tab-${categoryKey}`
} as const

/**
 * data-test-locator roots for the global search overlay (distinct from per-tab panel locators).
 */
const programSettingsSearchSelector = {
  setting: (settingKey: string) => `dialogProgramSettings-search-setting-${settingKey}`
} as const

/**
 * Keys rendered in Program settings (PROGRAM_SETTINGS_OPTIONS); dialog rows must expose exactly this set on data-test-setting-id. Persisted I_faUserSettings may include additional keys such as languageCode that the dialog does not list.
 */
const expectedFaUserSettingKeysSorted = (
  Object.keys(PROGRAM_SETTINGS_OPTIONS) as (keyof typeof PROGRAM_SETTINGS_OPTIONS)[]
).slice().sort((keyA, keyB) => String(keyA).localeCompare(String(keyB)))

const programSettingsDirectInput: T_dialogName = 'ProgramSettings'

/**
 * q-input debounce is 300ms; allow slack for Electron paint after the model updates.
 */
const programSettingsSearchDebounceWaitMs = 400

const expectedProgramSettingsSearchNoResultsTitle = programSettingsMessages.searchNoResultsTitle
const expectedProgramSettingsSearchNoResultsDescription =
  programSettingsMessages.searchNoResultsDescription

/**
 * Types into the header settings search field and waits for the debounced filter to apply.
 */
const fillProgramSettingsSearch = async (page: Page, query: string): Promise<void> => {
  const searchInput = page.locator('.dialogProgramSettings__settingsSearchWrapper input').first()
  await searchInput.click()
  await searchInput.fill(query)
  await page.waitForTimeout(programSettingsSearchDebounceWaitMs)
}

/**
 * Clears the settings search field and waits for the normal tab panels to return.
 */
const clearProgramSettingsSearch = async (page: Page): Promise<void> => {
  await fillProgramSettingsSearch(page, '')
}

/**
 * One Electron session: chrome, copy walk, and settings search run while the dialog stays open; the close test runs last so earlier tests still see an open dialog.
 */
test.describe.serial('Program settings dialog', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: programSettingsDirectInput })
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
   * Feed "ProgramSettings" input and check if key dialog chrome opens.
   */
  test('Open test "ProgramSettings" dialog with title and actions', async () => {
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)

    await expect(closeButton).toHaveCount(1)
    await expect(title).toHaveCount(1)
  })

  /**
   * Program Settings copy matches en-US dialogs.programSettings (via buildExpectedProgramSettingsTreeFromEnUsMessages).
   * - Visits every vertical tab, category, subcategory, and setting row.
   * - Asserts titles, optional notes, tags, and help copy duplicated on data-test-tooltip-text.
   * - Hovers the first help icon once and asserts the live overlay with selectorList.quasarTooltip (retries hover + dismiss with expect().toPass because Quasar portaled tooltips are timing-sensitive under Electron); other rows skip hover.
   * - After each tab switch, unions data-test-setting-id from the active panel so the combined set matches PROGRAM_SETTINGS_OPTIONS keys exactly (Quasar mounts one panel at a time here).
   * - globalFunctionality.faUserSettings only covers save toasts, not these labels.
   */
  test('Program settings dialog matches en-US category, subcategory, and setting copy on every tab', async () => {
    test.setTimeout(120_000)

    const expectedTree = buildExpectedProgramSettingsTreeFromEnUsMessages()

    const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    await expect(title).toHaveCount(1)

    const dialogRoot = appWindow.locator(`.${selectorList.dialogProgramSettingsRootClass}`)

    /**
     * Flag to track if the first setting tooltip has been verified via hover
     */
    let verifiedFirstSettingTooltipViaHover = false

    const settingIdsSeenAcrossTabs = new Set<string>()

    for (const categoryKey of Object.keys(expectedTree)) {
      const category = expectedTree[categoryKey]
      const tab = appWindow.locator(`[data-test-locator="${programSettingsSelector.tab(categoryKey)}"]`)
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
        `[data-test-locator="${programSettingsSelector.category(categoryKey)}"]`
      )
      await expect(categorySection).toBeVisible()
      await expect(
        categorySection.locator(`[data-test-locator="${selectorList.categoryTitle}"]`)
      ).toHaveText(category.title)

      for (const [subCategoryKey, subCategory] of Object.entries(category.subCategories)) {
        const subSection = categorySection.locator(
          `[data-test-locator="${programSettingsSelector.subcategory(categoryKey, subCategoryKey)}"]`
        )
        await expect(
          subSection.locator(`[data-test-locator="${selectorList.subcategoryTitle}"]`)
        ).toHaveText(subCategory.title)

        for (const [settingKey, setting] of Object.entries(subCategory.settingsList)) {
          const settingRoot = appWindow.locator(
            `[data-test-locator="${programSettingsSelector.setting(settingKey)}"]`
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
              await appWindow.waitForTimeout(programSettingsTooltipOpenDelayMs)
              const liveTooltip = appWindow
                .locator(selectorList.quasarTooltip)
                .filter({ hasText: setting.description })
                .last()
              await expect(liveTooltip).toBeVisible({
                timeout: 4000
              })
              await expect(liveTooltip).toHaveText(setting.description)
            }).toPass({
              timeout: programSettingsTooltipVisibleTimeoutMs
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
   * Settings search overlay: title, tag, and description needles; empty state ErrorCard. Clearing the query restores tab interaction before the suite closes the dialog.
   */
  test('Program settings search finds Hide project name in tree by title match', async () => {
    const searchPanel = appWindow.locator('[data-test-locator="dialogProgramSettings-searchAllSettingsPanel"]')
    await expect(searchPanel).toHaveCount(0)

    await fillProgramSettingsSearch(appWindow, 'Hide project name in tree')

    await expect(searchPanel).toHaveCount(1)
    await expect(searchPanel).toBeVisible()

    const matchRoots = appWindow.locator('[data-test-locator^="dialogProgramSettings-search-setting-"]')
    await expect(matchRoots).toHaveCount(1)

    const projectNameRow = appWindow.locator(
      `[data-test-locator="${programSettingsSearchSelector.setting('noProjectName')}"]`
    )
    await expect(projectNameRow).toBeVisible()
    await expect(projectNameRow).toHaveAttribute('data-test-setting-id', 'noProjectName')

    await expect(
      appWindow.locator('[data-test-locator="dialogProgramSettings-searchNoResults"]')
    ).toBeHidden()

    await clearProgramSettingsSearch(appWindow)
    await expect(searchPanel).toHaveCount(0)
  })

  test('Program settings search finds dark mode by tag substring theme', async () => {
    await fillProgramSettingsSearch(appWindow, 'theme')

    const matchRoots = appWindow.locator('[data-test-locator^="dialogProgramSettings-search-setting-"]')
    await expect(matchRoots).toHaveCount(1)

    const darkModeRow = appWindow.locator(
      `[data-test-locator="${programSettingsSearchSelector.setting('darkMode')}"]`
    )
    await expect(darkModeRow).toBeVisible()
    await expect(darkModeRow).toHaveAttribute('data-test-setting-id', 'darkMode')
    await expect(darkModeRow).toHaveAttribute('data-test-tags', /theme/)

    await clearProgramSettingsSearch(appWindow)
  })

  test('Program settings search finds hide empty fields by description substring hides fields', async () => {
    await fillProgramSettingsSearch(appWindow, 'hides fields')

    const matchRoots = appWindow.locator('[data-test-locator^="dialogProgramSettings-search-setting-"]')
    await expect(matchRoots).toHaveCount(1)

    const hideEmptyFieldsRow = appWindow.locator(
      `[data-test-locator="${programSettingsSearchSelector.setting('hideEmptyFields')}"]`
    )
    await expect(hideEmptyFieldsRow).toBeVisible()
    await expect(hideEmptyFieldsRow).toHaveAttribute('data-test-setting-id', 'hideEmptyFields')

    await clearProgramSettingsSearch(appWindow)
  })

  test('Program settings search shows reading ErrorCard when query matches nothing', async () => {
    await fillProgramSettingsSearch(appWindow, 'no-exist-text-test')

    const noResults = appWindow.locator('[data-test-locator="dialogProgramSettings-searchNoResults"]')
    await expect(noResults).toBeVisible()

    const errorCard = appWindow.locator('[data-test-locator="errorCard"]')
    await expect(errorCard).toBeVisible()
    await expect(errorCard).toHaveAttribute('data-test-error-card-width', '650')

    const mascot = appWindow.locator('[data-test-locator="fantasiaMascotImage-image"]')
    await expect(mascot).toHaveCount(1)
    await expect(mascot).toHaveAttribute('data-test-image', 'reading')

    const titleLine = errorCard.locator('[data-test-locator="errorCard-title"]')
    await expect(titleLine).toHaveCount(1)
    await expect(titleLine).toHaveText(expectedProgramSettingsSearchNoResultsTitle)

    const descriptionLine = errorCard.locator('[data-test-locator="errorCard-description"]')
    await expect(descriptionLine).toHaveCount(1)
    await expect(descriptionLine).toHaveText(expectedProgramSettingsSearchNoResultsDescription)

    await clearProgramSettingsSearch(appWindow)
  })

  /**
   * Feed "ProgramSettings" input and check if dialog closes after Close click.
   */
  test('Open test "ProgramSettings" dialog and close it', async () => {
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
const showDocumentIDSettingKey = 'showDocumentID'
const postSaveSettingsWaitMs = 500
const tabSwitchSettleMs = 550

/**
 * showDocumentID
 * - Opens Developer Settings, asserts the toggle is off, turns it on, saves, waits, then reads persisted value through faUserSettings.getSettings() in the renderer.
 */
test.describe.serial('Program settings showDocumentID persists after Save', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: programSettingsDirectInput })
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

  test('showDocumentID persists after Save; getSettings returns true over the IPC bridge', async () => {
    const devTab = appWindow.locator(
      `[data-test-locator="${programSettingsSelector.tab(developerSettingsCategoryKey)}"]`
    )
    await expect(devTab).toHaveCount(1)
    await devTab.click()
    await appWindow.waitForTimeout(tabSwitchSettleMs)

    const settingRoot = appWindow.locator(
      `[data-test-locator="${programSettingsSelector.setting(showDocumentIDSettingKey)}"]`
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
test.describe.serial('Program settings showDocumentID defaults on fresh userData', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: programSettingsDirectInput })
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

  test('showDocumentID toggle is off on a fresh profile after Playwright userData reset', async () => {
    const devTab = appWindow.locator(
      `[data-test-locator="${programSettingsSelector.tab(developerSettingsCategoryKey)}"]`
    )
    await expect(devTab).toHaveCount(1)
    await devTab.click()
    await appWindow.waitForTimeout(tabSwitchSettleMs)

    const settingRoot = appWindow.locator(
      `[data-test-locator="${programSettingsSelector.setting(showDocumentIDSettingKey)}"]`
    )
    await expect(settingRoot).toHaveCount(1)

    const toggle = settingRoot.getByRole('switch')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
  })
})
