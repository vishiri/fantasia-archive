import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import type { T_dialogName } from 'app/types/T_dialogList'

import { buildExpectedProgramSettingsTreeFromEnUsMessages } from './DialogProgramSettings.playwright.expectations'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'

test.beforeEach(() => {
  resetFaPlaywrightIsolatedUserData()
})

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
const electronMainFilePath:string = extraEnvVariablesAPI.ELECTRON_MAIN_FILEPATH

/**
 * Buffer so the component-testing shell finishes rendering before assertions.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer:number = extraEnvVariablesAPI.FA_FRONTEND_RENDER_TIMER

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
 * Keys persisted as I_faUserSettings; dialog rows must expose exactly this set on data-test-setting-id.
 */
const expectedFaUserSettingKeysSorted = (
  Object.keys(FA_USER_SETTINGS_DEFAULTS) as (keyof I_faUserSettings)[]
).slice().sort((keyA, keyB) => String(keyA).localeCompare(String(keyB)))

/**
 * Feed "ProgramSettings" input and check if key dialog chrome opens.
 */
test('Open test "ProgramSettings" dialog with title and actions', async ({}, testInfo) => {
  const testString: T_dialogName = 'ProgramSettings'
  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath],
    ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
  })

  const appWindow = await electronApp.firstWindow()
  await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the close button and title locators
  const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
  const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)

  // Check if the tested elements exist
  await expect(closeButton).toHaveCount(1)
  await expect(title).toHaveCount(1)

  // Close the app
  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
})

/**
 * Feed "ProgramSettings" input and check if dialog closes after Close click.
 */
test('Open test "ProgramSettings" dialog and close it', async ({}, testInfo) => {
  const testString: T_dialogName = 'ProgramSettings'
  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath],
    ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
  })

  const appWindow = await electronApp.firstWindow()
  await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the close button and title locators
  const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
  const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)

  await expect(title).toHaveCount(1)
  await expect(closeButton).toHaveCount(1)
  await closeButton.click()

  await appWindow.waitForTimeout(1500)

  expect(await title.isHidden()).toBe(true)

  // Close the app
  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
})

/**
 * Program Settings copy matches en-US dialogs.programSettings (via buildExpectedProgramSettingsTreeFromEnUsMessages).
 * - Visits every vertical tab, category, subcategory, and setting row.
 * - Asserts titles, optional notes, tags, and help copy duplicated on data-test-tooltip-text.
 * - Hovers the first help icon once and asserts the live overlay with selectorList.quasarTooltip (retries hover + dismiss with expect().toPass because Quasar portaled tooltips are timing-sensitive under Electron); other rows skip hover.
 * - After each tab switch, unions data-test-setting-id from the active panel so the combined set matches I_faUserSettings keys exactly (Quasar mounts one panel at a time here).
 * - globalFunctionality.faUserSettings only covers save toasts, not these labels.
 */
test('Program settings dialog matches en-US category, subcategory, and setting copy on every tab', async ({}, testInfo) => {
  test.setTimeout(120_000)

  const testString: T_dialogName = 'ProgramSettings'
  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })
  const expectedTree = buildExpectedProgramSettingsTreeFromEnUsMessages()

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath],
    ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
  })

  const appWindow = await electronApp.firstWindow()
  await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
  await appWindow.waitForTimeout(faFrontendRenderTimer)

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

  // Close the app
  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
})

/**
 * showDocumentID: under category developerSettings (Developer Settings tab).
 * Serial block: first test persists true via Save + IPC; second assumes a fresh Playwright userData profile after resetFaPlaywrightIsolatedUserData in test.beforeEach.
 */
test.describe.serial('Program settings showDocumentID persistence and userData reset isolation', () => {
  const developerSettingsCategoryKey = 'developerSettings'
  const showDocumentIDSettingKey = 'showDocumentID'
  const postSaveSettingsWaitMs = 500
  const tabSwitchSettleMs = 550

  /**
   * showDocumentID
   * - Opens Developer Settings, asserts the toggle is off, turns it on, saves, waits, then reads persisted value through faUserSettings.getSettings() in the renderer.
   */
  test('showDocumentID persists after Save; getSettings returns true over the IPC bridge', async ({}, testInfo) => {
    const testString: T_dialogName = 'ProgramSettings'
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

    const electronApp = await electron.launch({
      env: extraEnvSettings,
      args: [electronMainFilePath],
      ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
    })

    const appWindow = await electronApp.firstWindow()
    await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
    await appWindow.waitForTimeout(faFrontendRenderTimer)

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

    await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
  })

  /**
   * showDocumentID
   * - After the prior test saved true to disk, test.beforeEach reset removes playwright-user-data so this run starts from defaults; Developer Settings toggle must be off.
   */
  test('showDocumentID toggle is off on a fresh profile after Playwright userData reset', async ({}, testInfo) => {
    const testString: T_dialogName = 'ProgramSettings'
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

    const electronApp = await electron.launch({
      env: extraEnvSettings,
      args: [electronMainFilePath],
      ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
    })

    const appWindow = await electronApp.firstWindow()
    await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
    await appWindow.waitForTimeout(faFrontendRenderTimer)

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

    await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
  })
})
