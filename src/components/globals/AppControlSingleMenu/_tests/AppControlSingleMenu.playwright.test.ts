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
import type { I_appMenuList } from 'app/types/I_appMenusDataList'
import { rgbToHex } from 'src/scripts/_utilities/colorFormatConvertors'

/**
 * Menu payload for this spec — must match what the app receives via 'COMPONENT_PROPS.dataInput'.
 */
const testData: I_appMenuList = {
  title: 'Test Title',
  data: [
    {
      mode: 'item',
      text: 'Test Button 1 - Open Dialog with Markdown document',
      icon: 'mdi-text-box-plus-outline',
      submenu: undefined,
      trigger: undefined,
      triggerArguments: ['changeLog'],
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: 'Test Button 2',
      icon: 'mdi-database-search',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'separator'
    },
    {
      mode: 'item',
      text: 'Test Button 3 - Secondary',
      icon: 'mdi-text-box-remove-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: 'secondary'
    },
    {
      mode: 'separator'
    },
    {
      mode: 'item',
      text: 'Test Button 4',
      icon: 'mdi-page-layout-sidebar-left',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: 'Test Button 5',
      icon: 'mdi-clipboard-text-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'separator'
    },
    {
      mode: 'item',
      text: 'Test Button 6 - Grey, Submenu',
      icon: 'keyboard_arrow_right',
      trigger: undefined,
      conditions: true,
      specialColor: 'grey',
      submenu: [
        {
          mode: 'item',
          text: 'Submenu-Test Button 1',
          icon: 'mdi-folder-plus-outline',
          trigger: undefined,
          conditions: true,
          specialColor: undefined
        },
        {
          mode: 'separator'
        },
        {
          mode: 'item',
          text: 'Submenu-Test Button 2 - Secondary',
          icon: 'mdi-wrench',
          trigger: undefined,
          conditions: true,
          specialColor: 'secondary'
        }
      ]
    }
  ]
}

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'AppControlSingleMenu',
  COMPONENT_PROPS: JSON.stringify({ dataInput: testData })
}

/**
 * Electron main filepath
 */
const electronMainFilePath:string = FA_ELECTRON_MAIN_JS_PATH

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer = FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  menuWrapper: 'AppControlSingleMenu-wrapper',
  menuTitle: 'AppControlSingleMenu-title',
  menuItem: 'AppControlSingleMenu-menuItem',
  menuItemText: 'AppControlSingleMenu-menuItem-text',
  menuItemIcon: 'AppControlSingleMenu-menuItem-icon',
  menuItemSubMenu: 'AppControlSingleMenu-menuItem-subMenu',
  menuItemSubMenuItem: 'AppControlSingleMenu-menuItem-subMenu-item',
  menuItemSubMenuItemText: 'AppControlSingleMenu-menuItem-subMenu-item-text',
  menuItemSubMenuItemIcon: 'AppControlSingleMenu-menuItem-subMenu-item-icon'
}

const menuAnimationTimer = 600

test.describe.serial('App control single menu', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ dataInput: testData })
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
   * Dismiss open Quasar menus or submenus so the next test starts from a closed trigger (one session would otherwise toggle closed on the first wrapper click).
   */
  async function dismissOpenMenus (): Promise<void> {
    await appWindow.keyboard.press('Escape')
    await appWindow.waitForTimeout(200)
    await appWindow.keyboard.press('Escape')
    await appWindow.waitForTimeout(200)
  }

  /**
   * Test if the component managed to load the test data
   */
  test('Test if the component managed to load the test data', async () => {
    const menuWrapperElement = appWindow.locator(`[data-test-locator="${selectorList.menuWrapper}"]`)

    await expect(menuWrapperElement).toHaveCount(1)

    const hasProperInput = await menuWrapperElement.evaluate(el => !!el.dataset.testHasProperDataInput)
    expect(hasProperInput).toBe(true)
  })

  /**
   * Load a custom "Test Title" menu button in the menu and check if it loaded
   */
  test('Check if the "Menu title" element is properly loaded and has proper text content in it', async () => {
    const menuTitleElement = appWindow.locator(`[data-test-locator="${selectorList.menuTitle}"]`)

    await expect(menuTitleElement).toHaveCount(1)

    const menuTitleElementText = await menuTitleElement.textContent()

    expect(menuTitleElementText).toEqual(testData.title)
  })

  /**
   * Check if the main menu has a wrapper, click and check if all menu elements loaded properly
   */
  test('Check if the main menu has a wrapper, click and check if all menu elements loaded properly', async () => {
    await dismissOpenMenus()

    const menuWrapper = appWindow.locator(`[data-test-locator="${selectorList.menuWrapper}"]`)

    await expect(menuWrapper).toHaveCount(1)
    await menuWrapper.click()

    const menuItems = appWindow.locator(`[data-test-locator="${selectorList.menuItem}"]`)
    const dataItems = testData.data.filter(item => item.mode === 'item')
    expect(menuItems).toHaveCount(dataItems.length)
  })

  /**
   * Check if the first main menu item has proper text and icon
   */
  test('Check if the first main menu item has proper text and icon', async () => {
    await dismissOpenMenus()

    const menuWrapper = appWindow.locator(`[data-test-locator="${selectorList.menuWrapper}"]`)

    await expect(menuWrapper).toHaveCount(1)
    await menuWrapper.click()

    const menuItems = appWindow.locator(`[data-test-locator="${selectorList.menuItem}"]`)
    const dataItems = testData.data.filter(item => item.mode === 'item')
    expect(menuItems).toHaveCount(dataItems.length)

    const firstMenuItemTextElement = menuItems.locator(`[data-test-locator="${selectorList.menuItemText}"]`).first()
    const firstMenuItemIconElement = menuItems.locator(`[data-test-locator="${selectorList.menuItemIcon}"]`).first()
    const firstDataItem = dataItems[0]

    await expect(firstMenuItemTextElement).toHaveCount(1)
    await expect(firstMenuItemIconElement).toHaveCount(1)

    const firstMenuItemText = await firstMenuItemTextElement.textContent()
    const firstDataItemText = firstDataItem.text
    expect(firstMenuItemText).toBe(firstDataItemText)

    const firstMenuItemIconClassList = await firstMenuItemIconElement.evaluate(el => el.classList.value)
    const firstDataItemIcon = firstDataItem.icon as string
    expect(firstMenuItemIconClassList.includes(firstDataItemIcon)).toBe(true)
  })

  /**
   * Check if text color class applied properly to any main menu item: Secondary
   */
  test('Check if text color class applied properly to any main menu item: Secondary', async () => {
    const testColorName = 'secondary'
    const testColorHex = '#f75746'

    await dismissOpenMenus()

    const menuWrapper = appWindow.locator(`[data-test-locator="${selectorList.menuWrapper}"]`)

    await expect(menuWrapper).toHaveCount(1)
    await menuWrapper.click()

    const colorMenuItem = appWindow.locator(`.text-${testColorName}[data-test-locator="${selectorList.menuItem}"]`)

    await expect(colorMenuItem).toHaveCount(1)

    const colorMenuRgb = await colorMenuItem.evaluate(el => getComputedStyle(el).getPropertyValue('color'))
    const colorMenuHex = rgbToHex(colorMenuRgb)
    expect(colorMenuHex).toBe(testColorHex)
  })

  /**
   * Check if the sub-menu opens properly on click of the main menu item and all parts are loaded properly
   */
  test('Check if the sub-menu opens properly on click of the main menu item and all parts are loaded properly', async () => {
    await dismissOpenMenus()

    const menuWrapper = appWindow.locator(`[data-test-locator="${selectorList.menuWrapper}"]`)

    await expect(menuWrapper).toHaveCount(1)
    await menuWrapper.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    const menuItems = appWindow.locator(`[data-test-locator="${selectorList.menuItem}"]`)
    const dataElement = testData.data.filter(item => item.mode === 'item').find(el => el.submenu !== undefined)
    const dataIndex = testData.data.filter(item => item.mode === 'item').findIndex(el => el.submenu !== undefined)

    const submenuTrigger = menuItems.nth(dataIndex)

    await expect(submenuTrigger).toHaveCount(1)
    await submenuTrigger.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    const subMenuWrapper = appWindow.locator(`[data-test-locator="${selectorList.menuItemSubMenu}"]`)

    await expect(subMenuWrapper).toHaveCount(1)

    const subMenuItems = appWindow.locator(`[data-test-locator="${selectorList.menuItemSubMenuItem}"]`)
    const dataSubmenuItems = (dataElement?.submenu !== undefined) ? dataElement.submenu.filter(item => item.mode === 'item') : false

    const dataSubmenuItemsCount = (dataSubmenuItems) ? dataSubmenuItems.length : -1
    expect(subMenuItems).toHaveCount(dataSubmenuItemsCount)
  })

  /**
   * Check if the first sub-menu item has proper text and icon
   */
  test('Check if the first sub-menu item has proper text and icon', async () => {
    await dismissOpenMenus()

    const menuWrapper = appWindow.locator(`[data-test-locator="${selectorList.menuWrapper}"]`)

    await expect(menuWrapper).toHaveCount(1)
    await menuWrapper.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    const menuItems = appWindow.locator(`[data-test-locator="${selectorList.menuItem}"]`)
    const dataElement = testData.data.filter(item => item.mode === 'item').find(el => el.submenu !== undefined)
    const dataIndex = testData.data.filter(item => item.mode === 'item').findIndex(el => el.submenu !== undefined)
    const submenuTrigger = menuItems.nth(dataIndex)

    await expect(submenuTrigger).toHaveCount(1)
    await submenuTrigger.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    const subMenuWrapper = appWindow.locator(`[data-test-locator="${selectorList.menuItemSubMenu}"]`)

    await expect(subMenuWrapper).toHaveCount(1)

    const firstSubMenuItem = appWindow.locator(`[data-test-locator="${selectorList.menuItemSubMenuItem}"]`).nth(0)
    const firstDataSubmenuItem = (dataElement?.submenu !== undefined) ? dataElement.submenu.filter(item => item.mode === 'item')[0] : false as unknown as { icon: string, text: string }

    await expect(firstSubMenuItem).toHaveCount(1)
    expect(firstDataSubmenuItem).not.toBe(false)

    const firstSubmenuItemTextElement = firstSubMenuItem.locator(`[data-test-locator="${selectorList.menuItemSubMenuItemText}"]`).first()
    const firstSubmenuItemIconElement = firstSubMenuItem.locator(`[data-test-locator="${selectorList.menuItemSubMenuItemIcon}"]`).first()

    await expect(firstSubmenuItemTextElement).toHaveCount(1)
    await expect(firstSubmenuItemIconElement).toHaveCount(1)

    const firstSubmenuItemText = await firstSubmenuItemTextElement.textContent()
    const firstDataItemText = firstDataSubmenuItem.text
    expect(firstSubmenuItemText).toBe(firstDataItemText)

    const firstSubmenuItemIconClassList = await firstSubmenuItemIconElement.evaluate(el => el.classList.value)
    const firstDataItemIcon = firstDataSubmenuItem.icon as string
    expect(firstSubmenuItemIconClassList.includes(firstDataItemIcon)).toBe(true)
  })

  /**
   * Check if text color class applied properly to any sub-main menu item: Secondary
   */
  test('Check if text color class applied properly to any sub-main menu item: Secondary', async () => {
    const testColorString = 'secondary'
    const testColorHexString = '#f75746'

    await dismissOpenMenus()

    const menuWrapper = appWindow.locator(`[data-test-locator="${selectorList.menuWrapper}"]`)

    await expect(menuWrapper).toHaveCount(1)
    await menuWrapper.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    const menuItems = appWindow.locator(`[data-test-locator="${selectorList.menuItem}"]`)
    const dataIndex = testData.data.filter(item => item.mode === 'item').findIndex(el => el.submenu !== undefined)
    const submenuTrigger = menuItems.nth(dataIndex)

    await expect(submenuTrigger).toHaveCount(1)
    await submenuTrigger.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    const subMenuWrapper = appWindow.locator(`[data-test-locator="${selectorList.menuItemSubMenu}"]`)

    await expect(subMenuWrapper).toHaveCount(1)

    const colorSubMenuItem = appWindow.locator(`.text-${testColorString}[data-test-locator="${selectorList.menuItemSubMenuItem}"]`)

    await expect(colorSubMenuItem).toHaveCount(1)

    const colorMenuRgb = await colorSubMenuItem.evaluate(el => getComputedStyle(el).getPropertyValue('color'))
    const colorMenuHex = rgbToHex(colorMenuRgb)

    expect(colorMenuHex).toBe(testColorHexString)
  })
})
