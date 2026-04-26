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
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import actionMonitorMessages from 'app/i18n/en-US/dialogs/L_DialogActionMonitor'
import type { I_faActionHistoryEntry } from 'app/types/I_faActionManagerDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogActionMonitor',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Electron main filepath
 */
const electronMainFilePath: string = FA_ELECTRON_MAIN_JS_PATH

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  closeButton: 'dialogComponent-button-close',
  emptyState: 'dialogActionMonitor-empty',
  rowClickHint: 'dialogActionMonitor-rowClickHint',
  statusFailed: 'dialogActionMonitor-status-failed',
  statusQueued: 'dialogActionMonitor-status-queued',
  statusRunning: 'dialogActionMonitor-status-running',
  statusSuccess: 'dialogActionMonitor-status-success',
  table: 'dialogActionMonitor-table'
} as const

const actionMonitorDirectInput: T_dialogName = 'ActionMonitor'

/**
 * Four synthetic history rows (newest first) so the table shows running, success, failed, and queued affordances.
 * 'directHistorySnapshot' bypasses Pinia; ids must stay within 'T_faActionId'.
 */
const directHistorySnapshotPlaywrightFixture: I_faActionHistoryEntry[] = [
  {
    enqueuedAt: 4_000,
    id: 'openActionMonitorDialog',
    kind: 'async',
    startedAt: 4_001,
    status: 'running',
    uid: 'pw-playwright-running'
  },
  {
    enqueuedAt: 3_000,
    finishedAt: 3_002,
    id: 'toggleDeveloperTools',
    kind: 'async',
    startedAt: 3_001,
    status: 'success',
    uid: 'pw-playwright-success'
  },
  {
    enqueuedAt: 2_000,
    errorMessage: 'Playwright fixture failure',
    finishedAt: 2_002,
    id: 'saveKeybindSettings',
    kind: 'async',
    payloadPreview: '{"overrides":{}}',
    startedAt: 2_001,
    status: 'failed',
    uid: 'pw-playwright-failed'
  },
  {
    enqueuedAt: 1_000,
    id: 'closeApp',
    kind: 'sync',
    status: 'queued',
    uid: 'pw-playwright-queued'
  }
]

test.describe.serial('Action monitor dialog', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: actionMonitorDirectInput })
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
   * directInput ActionMonitor opens the dialog; title, empty session copy, and close match en-US strings.
   */
  test('Open test ActionMonitor dialog with title, empty state, and close control', async () => {
    const card = appWindow.locator('.dialogActionMonitor')
    await expect(card).toBeVisible()

    const title = appWindow.locator('#dialogActionMonitor-title')
    await expect(title).toHaveCount(1)
    await expect(title).toHaveText(actionMonitorMessages.title)

    const empty = appWindow.locator(`[data-test-locator="${selectorList.emptyState}"]`)
    await expect(empty).toBeVisible()
    await expect(empty).toHaveText(actionMonitorMessages.emptyState)

    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    await expect(closeButton).toHaveCount(1)
    await expect(closeButton).toBeVisible()
    await expect(closeButton).toHaveText(actionMonitorMessages.closeButton)
  })

  /**
   * Close dismisses the dialog card so it is no longer shown.
   */
  test('ActionMonitor dialog closes when Close is pressed', async () => {
    const card = appWindow.locator('.dialogActionMonitor')
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)

    await expect(card).toBeVisible()
    await expect(closeButton).toHaveCount(1)
    await closeButton.click()

    await expect(card).toBeHidden({
      timeout: 15_000
    })
  })
})

test.describe.serial('Action monitor dialog (fixture history)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  const extraEnvSettingsFixture = {
    TEST_ENV: 'components',
    COMPONENT_NAME: 'DialogActionMonitor',
    COMPONENT_PROPS: JSON.stringify({
      directHistorySnapshot: directHistorySnapshotPlaywrightFixture,
      directInput: actionMonitorDirectInput
    })
  }

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    resetFaPlaywrightIsolatedUserData()
    electronApp = await electron.launch({
      env: extraEnvSettingsFixture,
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
   * directHistorySnapshot supplies four rows; status cells show spinner, success icon, failure icon, and queued mdi-timer-sand-empty (fa-text-status-queued); each has a tooltip with the status meaning.
   * Payload column shows a green check for rows with payload preview, grey dash (empty marker) otherwise.
   * Thead and six data-cell locators match the current column set; run yarn quasar:build:electron:summarized when the renderer bundle is stale.
   */
  test('Open ActionMonitor with fixture rows shows table, status affordances, and copy hint', async () => {
    const card = appWindow.locator('.dialogActionMonitor')
    await expect(card).toBeVisible()

    const title = appWindow.locator('#dialogActionMonitor-title')
    await expect(title).toHaveText(actionMonitorMessages.title)

    const table = appWindow.locator(`[data-test-locator="${selectorList.table}"]`)
    await expect(table).toBeVisible()

    const actionCells = appWindow.locator('[data-test-locator="dialogActionMonitor-cell-action"]')
    await expect(actionCells).toHaveCount(4)

    const headerLabels = [
      actionMonitorMessages.columns.action,
      actionMonitorMessages.columns.startTime,
      actionMonitorMessages.columns.finishTime,
      actionMonitorMessages.columns.payload,
      actionMonitorMessages.columns.type,
      actionMonitorMessages.columns.status
    ]
    const thead = table.locator('thead')
    for (const label of headerLabels) {
      await expect(thead).toContainText(label)
    }
    await expect(table.locator('thead th')).toHaveCount(6)

    await expect(appWindow.locator('[data-test-locator="dialogActionMonitor-cell-startTime"]')).toHaveCount(4)
    await expect(appWindow.locator('[data-test-locator="dialogActionMonitor-cell-finishTime"]')).toHaveCount(4)
    await expect(appWindow.locator('[data-test-locator="dialogActionMonitor-cell-payload"]')).toHaveCount(4)
    await expect(appWindow.locator('[data-test-locator="dialogActionMonitor-cell-payload-empty"]')).toHaveCount(3)
    await expect(appWindow.locator('[data-test-locator="dialogActionMonitor-cell-type"]')).toHaveCount(4)

    const hint = appWindow.locator(`[data-test-locator="${selectorList.rowClickHint}"]`)
    await expect(hint).toBeVisible()
    await expect(hint).toHaveAttribute('aria-label', actionMonitorMessages.rowClickHint)

    const rows = table.locator('tbody tr')
    await expect(rows).toHaveCount(4)

    const rowRunning = rows.filter({ hasText: 'openActionMonitorDialog' })
    await expect(rowRunning.locator(`[data-test-locator="${selectorList.statusRunning}"]`)).toBeVisible()
    await expect(rowRunning.locator('[data-test-locator="dialogActionMonitor-cell-payload-empty"]')).toBeVisible()
    await expect(rowRunning.locator('[data-test-locator="dialogActionMonitor-cell-payload"] .text-positive')).toHaveCount(0)

    const rowSuccess = rows.filter({ hasText: 'toggleDeveloperTools' })
    await expect(rowSuccess.locator(`[data-test-locator="${selectorList.statusSuccess}"]`)).toBeVisible()
    await expect(rowSuccess.locator('[data-test-locator="dialogActionMonitor-cell-payload-empty"]')).toBeVisible()
    await expect(rowSuccess.locator('[data-test-locator="dialogActionMonitor-cell-payload"] .text-positive')).toHaveCount(0)

    const rowFailed = rows.filter({ hasText: 'saveKeybindSettings' })
    await expect(rowFailed.locator(`[data-test-locator="${selectorList.statusFailed}"]`)).toBeVisible()
    await expect(
      rowFailed.locator('[data-test-locator="dialogActionMonitor-cell-payload"] .text-positive')
    ).toBeVisible()
    await expect(rowFailed.locator('[data-test-locator="dialogActionMonitor-cell-payload-empty"]')).toHaveCount(0)

    const rowQueued = rows.filter({ hasText: 'closeApp' })
    await expect(rowQueued.locator(`[data-test-locator="${selectorList.statusQueued}"]`)).toBeVisible()
    await expect(
      rowQueued.locator(`[data-test-locator="${selectorList.statusQueued}"] .fa-text-status-queued`)
    ).toBeVisible()
    await expect(rowQueued.locator('.sr-only')).toHaveText(actionMonitorMessages.status.queued)
    await expect(rowQueued.locator('[data-test-locator="dialogActionMonitor-cell-type"]')).toHaveText(
      actionMonitorMessages.actionKind.sync
    )
    await expect(rowQueued.locator('[data-test-locator="dialogActionMonitor-cell-payload-empty"]')).toBeVisible()
    await expect(rowQueued.locator('[data-test-locator="dialogActionMonitor-cell-payload"] .text-positive')).toHaveCount(0)

    await expect(rowRunning.locator('[data-test-locator="dialogActionMonitor-cell-type"]')).toHaveText(
      actionMonitorMessages.actionKind.async
    )
    await expect(rowSuccess.locator('[data-test-locator="dialogActionMonitor-cell-type"]')).toHaveText(
      actionMonitorMessages.actionKind.async
    )
    await expect(rowFailed.locator('[data-test-locator="dialogActionMonitor-cell-type"]')).toHaveText(
      actionMonitorMessages.actionKind.async
    )
  })

  /**
   * Close dismisses the dialog card so it is no longer shown.
   */
  test('Fixture ActionMonitor dialog closes when Close is pressed', async () => {
    const card = appWindow.locator('.dialogActionMonitor')
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)

    await expect(card).toBeVisible()
    await closeButton.click()

    await expect(card).toBeHidden({
      timeout: 15_000
    })
  })
})
