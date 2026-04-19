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
import keybindDialogMessages from 'app/i18n/en-US/dialogs/L_dialogKeybindSettings'
import { FA_KEYBIND_COMMAND_DEFINITIONS } from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import { buildDialogKeybindSettingsRows } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsTable'
import { formatFaKeybindChordForUi } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogKeybindSettings',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Electron main filepath
 */
const electronMainFilePath: string = FA_ELECTRON_MAIN_JS_PATH

/**
 * Buffer so the component-testing shell finishes rendering before assertions.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

/**
 * q-input debounce is 300ms; allow slack for Electron paint after the model updates.
 */
const keybindSettingsSearchDebounceWaitMs = 400

/**
 * Playwright hooks: stable data-test-locator ids and shared ErrorCard or mascot selectors.
 */
const selectorList = {
  errorCard: 'errorCard',
  errorCardDetails: 'errorCard-details',
  errorCardTitle: 'errorCard-title',
  fantasiaMascotImage: 'fantasiaMascotImage-image',
  filterNoResults: 'dialogKeybindSettings-filterNoResults',
  saveButton: 'dialogKeybindSettings-save',
  title: 'dialogKeybindSettings-title',
  userKeybindButton: 'dialogKeybindSettings-userKeybind-button'
}

const keybindSettingsDirectInput: T_dialogName = 'KeybindSettings'

const COMMAND_MESSAGE_PREFIX = 'dialogs.keybindSettings.commands.' as const

/**
 * Maps FA_KEYBIND_COMMAND_DEFINITIONS messageKey values to en-US dialog strings (same source as runtime i18n for these keys).
 */
function tDialogKeybindSettingsCommandsFromEnUs (key: string): string {
  if (!key.startsWith(COMMAND_MESSAGE_PREFIX)) {
    throw new Error(`Unexpected keybind messageKey ${key}`)
  }
  const id = key.slice(COMMAND_MESSAGE_PREFIX.length) as keyof typeof keybindDialogMessages.commands
  const value = keybindDialogMessages.commands[id]
  if (typeof value !== 'string') {
    throw new Error(`Missing commands translation for ${String(id)}`)
  }
  return value
}

/**
 * Types into the table filter field and waits for the debounced filter to apply.
 */
const fillKeybindSettingsFilter = async (page: Page, query: string): Promise<void> => {
  const searchInput = page.getByPlaceholder(keybindDialogMessages.filterPlaceholder)
  await searchInput.click()
  await searchInput.fill(query)
  await page.waitForTimeout(keybindSettingsSearchDebounceWaitMs)
}

/**
 * Clears the filter field and waits for the full table to return.
 */
const clearKeybindSettingsFilter = async (page: Page): Promise<void> => {
  await fillKeybindSettingsFilter(page, '')
}

/**
 * Same substring as the filter test: matches the en-US Toggle developer tools action label so the row is isolated even when more commands exist or virtual-scroll hides other rows.
 */
const keybindSettingsDeveloperToolsFilterQuery = 'developer tools'

const keybindSettingsActionMonitorFilterQuery = 'action monitor'

/**
 * Filters the table like the developer-tools filter test, then returns the tbody row that shows that action name.
 */
async function locatorToggleDeveloperToolsRowAfterFilter (page: Page): Promise<Locator> {
  await fillKeybindSettingsFilter(page, keybindSettingsDeveloperToolsFilterQuery)
  return page.locator('.dialogKeybindSettings__table').locator('tbody tr').filter({
    hasText: keybindDialogMessages.commands.toggleDeveloperTools
  })
}

test.describe.serial('Keybind settings dialog list, defaults, and filter', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: keybindSettingsDirectInput
    })
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
   * Dialog opens from directInput; table lists every command with en-US titles, default chord labels, and user column showing only the default Add new affordance.
   */
  test('Keybind settings lists all commands with en-US titles and default-only user keybind column', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    await expect(title).toHaveCount(1)
    await expect(title).toHaveText(keybindDialogMessages.title)

    const snap = await appWindow.evaluate(async () => {
      const api = window.faContentBridgeAPIs?.faKeybinds
      if (typeof api?.getKeybinds !== 'function') {
        throw new Error('faKeybinds.getKeybinds is not available')
      }
      return await api.getKeybinds()
    })

    expect(Object.keys(snap.store.overrides)).toHaveLength(0)

    const expectedRows = buildDialogKeybindSettingsRows({
      overrides: snap.store.overrides,
      platform: snap.platform,
      t: tDialogKeybindSettingsCommandsFromEnUs
    })
    expect(expectedRows).toHaveLength(FA_KEYBIND_COMMAND_DEFINITIONS.length)

    const tableRoot = appWindow.locator('.dialogKeybindSettings__table')
    await expect(
      tableRoot.locator(`[data-test-locator="${selectorList.userKeybindButton}"]`)
    ).toHaveCount(FA_KEYBIND_COMMAND_DEFINITIONS.length)

    for (const expected of expectedRows) {
      if (expected.commandId === 'toggleDeveloperTools') {
        await fillKeybindSettingsFilter(appWindow, keybindSettingsDeveloperToolsFilterQuery)
      }
      if (expected.commandId === 'openActionMonitor') {
        await fillKeybindSettingsFilter(appWindow, keybindSettingsActionMonitorFilterQuery)
      }
      const row = tableRoot.locator('tbody tr').filter({
        hasText: expected.nameLabel
      })
      await expect(row).toHaveCount(1)
      const cells = row.locator('td')
      await expect(cells.nth(0)).toHaveText(expected.nameLabel)
      await expect(cells.nth(2)).toHaveText(expected.defaultLabel)
      await expect(
        row.locator(`[data-test-locator="${selectorList.userKeybindButton}"]`)
      ).toHaveText(keybindDialogMessages.addNew)
      if (expected.commandId === 'toggleDeveloperTools') {
        await clearKeybindSettingsFilter(appWindow)
      }
      if (expected.commandId === 'openActionMonitor') {
        await clearKeybindSettingsFilter(appWindow)
      }
    }
  })

  /**
   * Filter matches the Toggle developer tools action label substring (case-insensitive).
   */
  test('Keybind settings filter finds Toggle developer tools as a single row', async () => {
    await fillKeybindSettingsFilter(appWindow, keybindSettingsDeveloperToolsFilterQuery)

    const tableRoot = appWindow.locator('.dialogKeybindSettings__table')
    await expect(
      tableRoot.locator(`[data-test-locator="${selectorList.userKeybindButton}"]`)
    ).toHaveCount(1)
    const matchRow = tableRoot.locator('tbody tr').filter({
      hasText: keybindDialogMessages.commands.toggleDeveloperTools
    })
    await expect(matchRow).toHaveCount(1)
    await expect(matchRow.locator('td').first()).toHaveText(
      keybindDialogMessages.commands.toggleDeveloperTools
    )

    await clearKeybindSettingsFilter(appWindow)
  })

  /**
   * Unknown query shows the reading ErrorCard and Fantasia mascot copy from en-US dialogs.keybindSettings.
   */
  test('Keybind settings filter empty state shows ErrorCard and mascot', async () => {
    await fillKeybindSettingsFilter(appWindow, 'nonsenseoflorem')

    const noResults = appWindow.locator(`[data-test-locator="${selectorList.filterNoResults}"]`)
    await expect(noResults).toBeVisible()

    const errorCard = appWindow.locator(`[data-test-locator="${selectorList.errorCard}"]`)
    await expect(errorCard).toBeVisible()
    await expect(errorCard).toHaveAttribute('data-test-error-card-width', '650')

    const mascot = appWindow.locator(`[data-test-locator="${selectorList.fantasiaMascotImage}"]`)
    await expect(mascot).toHaveCount(1)
    await expect(mascot).toHaveAttribute('data-test-image', 'reading')

    const titleLine = errorCard.locator(`[data-test-locator="${selectorList.errorCardTitle}"]`)
    await expect(titleLine).toHaveCount(1)
    await expect(titleLine).toHaveText(keybindDialogMessages.filterNoResultsTitle)

    const detailsLine = errorCard.locator(`[data-test-locator="${selectorList.errorCardDetails}"]`)
    await expect(detailsLine).toHaveCount(1)
    await expect(detailsLine).toHaveText(keybindDialogMessages.filterNoResultsDescription)

    await clearKeybindSettingsFilter(appWindow)
  })
})

test.describe.serial('Keybind settings toggleDeveloperTools persists after Save', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: keybindSettingsDirectInput
    })
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
   * Capture Ctrl plus Shift plus F11 for Toggle developer tools (default is Ctrl + F12), save, and confirm the main bridge stores the override.
   */
  test('Toggle developer tools accepts Ctrl + Shift + F11 and save closes the dialog', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    await expect(title).toBeVisible()

    const devRow = await locatorToggleDeveloperToolsRowAfterFilter(appWindow)
    await expect(devRow).toHaveCount(1)
    await devRow.locator(`[data-test-locator="${selectorList.userKeybindButton}"]`).click()

    const captureCard = appWindow.locator('[data-test-locator="dialogKeybindSettings-capture-card"]')
    await expect(captureCard).toBeVisible()

    await appWindow.locator('[data-test-locator="dialogKeybindSettings-capture-qfield"]').click()
    await appWindow.keyboard.press('Control+Shift+F11')

    const setButton = appWindow.locator('[data-test-locator="dialogKeybindSettings-capture-set"]')
    await expect(setButton).toBeEnabled()
    await setButton.click()
    await expect(captureCard).toBeHidden()

    const saveButton = appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    await saveButton.click()

    await expect(title).toBeHidden({
      timeout: 15_000
    })

    const snap = await appWindow.evaluate(async () => {
      const api = window.faContentBridgeAPIs?.faKeybinds
      if (typeof api?.getKeybinds !== 'function') {
        throw new Error('faKeybinds.getKeybinds is not available')
      }
      return await api.getKeybinds()
    })
    expect(snap.store.overrides.toggleDeveloperTools).toEqual({
      code: 'F11',
      mods: [
        'ctrl',
        'shift'
      ]
    })
  })

  /**
   * Full reload re-opens the harness dialog; the Toggle developer tools row still shows the saved chord label.
   */
  test('Toggle developer tools shows persisted Ctrl + Shift + F11 after reload and reopen', async () => {
    await appWindow.reload({
      waitUntil: 'domcontentloaded'
    })
    await appWindow.waitForTimeout(faFrontendRenderTimer)

    const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    await expect(title).toBeVisible()

    const snap = await appWindow.evaluate(async () => {
      const api = window.faContentBridgeAPIs?.faKeybinds
      if (typeof api?.getKeybinds !== 'function') {
        throw new Error('faKeybinds.getKeybinds is not available')
      }
      return await api.getKeybinds()
    })
    expect(snap.store.overrides.toggleDeveloperTools).toEqual({
      code: 'F11',
      mods: [
        'ctrl',
        'shift'
      ]
    })

    const expectedLabel = formatFaKeybindChordForUi(
      {
        code: 'F11',
        mods: [
          'ctrl',
          'shift'
        ]
      },
      snap.platform
    )

    const devRow = await locatorToggleDeveloperToolsRowAfterFilter(appWindow)
    await expect(devRow).toHaveCount(1)
    await expect(
      devRow.locator(`[data-test-locator="${selectorList.userKeybindButton}"]`)
    ).toHaveText(expectedLabel)
  })
})
