import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectMediaMessages from 'app/i18n/en-US/dialogs/L_projectMedia'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogProjectMedia',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer = FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  addChoiceDivider: 'dialogProjectMedia-addChoiceDivider',
  addDropZone: 'dialogProjectMedia-addDropZone',
  addDropZoneHintDrag: 'dialogProjectMedia-addDropZoneHintDrag',
  addDropZoneHintOr: 'dialogProjectMedia-addDropZoneHintOr',
  addOfflineMediaButton: 'dialogProjectMedia-addOfflineMediaButton',
  addOnlineMediaButton: 'dialogProjectMedia-addOnlineMediaButton',
  addOnlineUrls: 'dialogProjectMedia-addOnlineUrls',
  addOnlineUrlsInput: 'dialogProjectMedia-addOnlineUrlsInput',
  addOnlineUrlsSubmit: 'dialogProjectMedia-addOnlineUrlsSubmit',
  addOnlineUrlsTitle: 'dialogProjectMedia-addOnlineUrlsTitle',
  closeButton: 'dialogProjectMedia-button-close',
  massEditList: 'dialogProjectMedia-massEditList',
  massEditSaveAndBack: 'dialogProjectMedia-button-saveAndBackToList',
  massEditSaveAndClose: 'dialogProjectMedia-button-saveAndClose',
  listGrid: 'dialogProjectMedia-listGrid',
  search: 'dialogProjectMedia-search',
  titleAdd: 'dialogProjectMedia-title-mediaAdd',
  titleAddOnline: 'dialogProjectMedia-title-mediaAddOnlineUrls',
  titleList: 'dialogProjectMedia-title-mediaList',
  titleMassEdit: 'dialogProjectMedia-title-mediaMassEdit',
  titleSingle: 'dialogProjectMedia-title-mediaSingleEdit',
  singleEditClose: 'dialogProjectMedia-singleEdit-close',
  singleEditSaveAndClose: 'dialogProjectMedia-singleEdit-saveAndClose'
} as const

const projectMediaDirectInput: T_dialogName = 'ProjectMedia'

test.describe.serial('Project Media dialog', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: projectMediaDirectInput })
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
   * Feed ProjectMedia input and check title, list panel, search, and close chrome.
   */
  test('Open test "ProjectMedia" dialog with title, list search, and close', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.titleList}"]`)
    const listGrid = appWindow.locator(`[data-test-locator="${selectorList.listGrid}"]`)
    const massEditList = appWindow.locator(`[data-test-locator="${selectorList.massEditList}"]`)
    const massEditSaveAndBack = appWindow.locator(
      `[data-test-locator="${selectorList.massEditSaveAndBack}"]`
    )
    const massEditSaveAndClose = appWindow.locator(
      `[data-test-locator="${selectorList.massEditSaveAndClose}"]`
    )
    const search = appWindow.locator(`[data-test-locator="${selectorList.search}"]`)
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)

    await expect(title).toHaveCount(1)
    await expect(title).toHaveText(projectMediaMessages.titleList)
    await expect(title).toBeVisible()
    await expect(listGrid).toBeVisible()
    await expect(search).toBeVisible()
    await expect(massEditList).toBeHidden()
    await expect(massEditSaveAndBack).toBeHidden()
    await expect(massEditSaveAndClose).toBeHidden()
    await expect(closeButton).toHaveCount(1)
    await expect(closeButton).toHaveText(projectMediaMessages.closeButton)
  })

  /**
   * Sticky dialog: Escape must not close Project Media.
   */
  test('Open test "ProjectMedia" dialog and Escape does not close', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.titleList}"]`)
    await expect(title).toBeVisible()
    await appWindow.keyboard.press('Escape')
    await expect(title).toBeVisible()
  })

  /**
   * Feed ProjectMedia input and check if dialog closes after button click.
   */
  test('Open test "ProjectMedia" dialog and try closing it', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.titleList}"]`)
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)

    await expect(title).toHaveCount(1)
    await expect(closeButton).toHaveCount(1)
    await closeButton.click()

    await appWindow.waitForTimeout(1500)

    expect(await title.isHidden()).toBe(true)
  })
})

test.describe.serial('Project Media dialog add panel', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: projectMediaDirectInput,
      initialPanel: 'mediaAdd'
    })
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

  test('Open test "ProjectMedia" dialog on Media Addition panel', async () => {
    const dropZone = appWindow.locator(`[data-test-locator="${selectorList.addDropZone}"]`)
    const addOffline = appWindow.locator(
      `[data-test-locator="${selectorList.addOfflineMediaButton}"]`
    )
    const addOnline = appWindow.locator(`[data-test-locator="${selectorList.addOnlineMediaButton}"]`)
    const divider = appWindow.locator(`[data-test-locator="${selectorList.addChoiceDivider}"]`)
    const hintOr = appWindow.locator(`[data-test-locator="${selectorList.addDropZoneHintOr}"]`)
    const hintDrag = appWindow.locator(`[data-test-locator="${selectorList.addDropZoneHintDrag}"]`)
    const search = appWindow.locator(`[data-test-locator="${selectorList.search}"]`)
    const titleAdd = appWindow.locator(`[data-test-locator="${selectorList.titleAdd}"]`)
    const titleList = appWindow.locator(`[data-test-locator="${selectorList.titleList}"]`)

    await expect(titleAdd).toBeVisible()
    await expect(titleAdd).toHaveText(projectMediaMessages.titleAdd)
    await expect(titleList).toBeHidden()

    await expect(dropZone).toBeVisible()
    await expect(addOffline).toBeVisible()
    await expect(addOffline).toHaveText(projectMediaMessages.addOfflineMediaButton)
    await expect(addOnline).toBeVisible()
    await expect(addOnline).toHaveText(projectMediaMessages.addOnlineMediaButton)
    await expect(divider).toBeVisible()
    await expect(hintOr).toBeVisible()
    await expect(hintOr).toHaveText(projectMediaMessages.addMediaDropZoneOr)
    await expect(hintDrag).toBeVisible()
    await expect(hintDrag).toHaveText(projectMediaMessages.addMediaDropZoneDrag)
    await expect(search).toBeHidden()
  })

  test('Open test "ProjectMedia" dialog Add online media URL textarea', async () => {
    const addOnline = appWindow.locator(`[data-test-locator="${selectorList.addOnlineMediaButton}"]`)
    const dropZone = appWindow.locator(`[data-test-locator="${selectorList.addDropZone}"]`)
    const urlsPane = appWindow.locator(`[data-test-locator="${selectorList.addOnlineUrls}"]`)
    const urlsTitle = appWindow.locator(`[data-test-locator="${selectorList.addOnlineUrlsTitle}"]`)
    const urlsInput = appWindow.locator(`[data-test-locator="${selectorList.addOnlineUrlsInput}"]`)
    const urlsSubmit = appWindow.locator(`[data-test-locator="${selectorList.addOnlineUrlsSubmit}"]`)
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const titleAdd = appWindow.locator(`[data-test-locator="${selectorList.titleAdd}"]`)
    const titleAddOnline = appWindow.locator(`[data-test-locator="${selectorList.titleAddOnline}"]`)

    await expect(dropZone).toBeVisible()
    await addOnline.click()
    await expect(dropZone).toBeHidden()
    await expect(urlsPane).toBeVisible()
    await expect(titleAdd).toBeHidden()
    await expect(titleAddOnline).toBeVisible()
    await expect(titleAddOnline).toHaveText(projectMediaMessages.titleAddOnline)
    await expect(urlsTitle).toBeVisible()
    await expect(urlsTitle).toHaveText(projectMediaMessages.addOnlineUrlsTitle)
    expect(await urlsTitle.evaluate((el) => el.tagName)).toBe('H6')
    await expect(urlsInput).toBeVisible()
    expect(await urlsInput.evaluate((el) => el.tagName)).toBe('TEXTAREA')
    await expect(urlsInput).toBeFocused()
    await expect(urlsSubmit).toBeVisible()
    await expect(urlsSubmit).toBeDisabled()
    await expect(urlsSubmit).toHaveText(projectMediaMessages.addOnlineUrlsSubmitButton)
    await expect(closeButton).toBeVisible()
    await expect(closeButton).toHaveText(projectMediaMessages.closeButton)
    await urlsInput.fill('not-a-url')
    await expect(urlsSubmit).toBeEnabled()
  })
})

test.describe.serial('Project Media dialog add panel Escape', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: projectMediaDirectInput,
      initialPanel: 'mediaAdd'
    })
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

  test('Open test "ProjectMedia" add drop zone and Escape closes', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.titleAdd}"]`)
    const dropZone = appWindow.locator(`[data-test-locator="${selectorList.addDropZone}"]`)
    await expect(dropZone).toBeVisible()
    await expect(title).toBeVisible()
    await appWindow.keyboard.press('Escape')
    await expect(title).toBeHidden()
  })
})

test.describe.serial('Project Media dialog add online URLs empty Escape', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: projectMediaDirectInput,
      initialPanel: 'mediaAdd'
    })
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

  test('Open test "ProjectMedia" empty URL panel and Escape closes', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.titleAddOnline}"]`)
    const addOnline = appWindow.locator(`[data-test-locator="${selectorList.addOnlineMediaButton}"]`)
    const urlsPane = appWindow.locator(`[data-test-locator="${selectorList.addOnlineUrls}"]`)
    await addOnline.click()
    await expect(urlsPane).toBeVisible()
    await expect(title).toBeVisible()
    await appWindow.keyboard.press('Escape')
    await expect(title).toBeHidden()
  })
})

test.describe.serial('Project Media dialog add online URLs filled Escape', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: projectMediaDirectInput,
      initialPanel: 'mediaAdd'
    })
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

  test('Open test "ProjectMedia" filled URL panel and Escape stays until Close', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.titleAddOnline}"]`)
    const addOnline = appWindow.locator(`[data-test-locator="${selectorList.addOnlineMediaButton}"]`)
    const urlsInput = appWindow.locator(`[data-test-locator="${selectorList.addOnlineUrlsInput}"]`)
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    await addOnline.click()
    await urlsInput.fill('https://example.com/media')
    await expect(title).toBeVisible()
    await appWindow.keyboard.press('Escape')
    await expect(title).toBeVisible()
    await closeButton.click()
    await appWindow.waitForTimeout(1500)
    expect(await title.isHidden()).toBe(true)
  })
})

test.describe.serial('Project Media dialog mass-edit Escape', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: projectMediaDirectInput,
      initialPanel: 'mediaMassEdit'
    })
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

  test('Open test "ProjectMedia" mass-edit and Escape does not close', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.titleMassEdit}"]`)
    const massEditList = appWindow.locator(`[data-test-locator="${selectorList.massEditList}"]`)
    await expect(massEditList).toBeVisible()
    await expect(title).toBeVisible()
    await expect(title).toHaveText(projectMediaMessages.titleMassEdit)
    await appWindow.keyboard.press('Escape')
    await expect(title).toBeVisible()
  })
})

test.describe.serial('Project Media dialog single-edit empty', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: projectMediaDirectInput,
      initialPanel: 'mediaSingleEdit'
    })
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

  test('Open test "ProjectMedia" single-edit empty title and disabled save', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.titleSingle}"]`)
    const genericClose = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const tabClose = appWindow.locator(`[data-test-locator="${selectorList.singleEditClose}"]`)
    const saveAndClose = appWindow.locator(
      `[data-test-locator="${selectorList.singleEditSaveAndClose}"]`
    )
    await expect(title).toBeVisible()
    await expect(title).toHaveText(projectMediaMessages.titleSingle)
    await expect(genericClose).toHaveCount(0)
    await expect(tabClose).toBeVisible()
    await expect(tabClose).toHaveText(projectMediaMessages.closeButton)
    await expect(saveAndClose).toBeVisible()
    await expect(saveAndClose).toBeDisabled()
    await expect(saveAndClose).toHaveText(projectMediaMessages.singleEditSaveAndCloseButton)
    await appWindow.keyboard.press('Escape')
    await expect(title).toBeHidden()
  })
})
