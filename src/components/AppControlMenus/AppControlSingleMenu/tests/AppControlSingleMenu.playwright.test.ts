import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import { testData } from './_testData'
import { rgbToHex } from 'src/scripts/_utilities/colorFormatConvertors'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'AppControlSingleMenu',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Electron main filepath
 */
const electronMainFilePath:string = extraEnvVariablesAPI.ELECTRON_MAIN_FILEPATH

/**
 * Extra rended timer buffer for tests to start after loading the app
 * - Change here in order manually adjust this component's wait times
 */
const faFrontendRenderTimer = extraEnvVariablesAPI.FA_FRONTEND_RENDER_TIMER

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

/**
 * Test if the component managed to load the test data
 */
test('Test if the component managed to load the test data', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const menuWrapperElement = appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if the tested element exists
  await expect(menuWrapperElement).toHaveCount(1)

  // Check if the tested element has proper data input
  const hasProperInput = await menuWrapperElement.evaluate(el => !!el.dataset.testHasProperDataInput)
  expect(hasProperInput).toBe(true)

  // Close the app
  await electronApp.close()
})

/**
 * Load a custom "Test Title" menu button in the menu and check if it loaded
 */
test('Check if the "Menu title" element is properly loaded and has proper text content in it', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const menuTitleElement = appWindow.locator(`[data-test="${selectorList.menuTitle}"]`)

  // Check if the tested element exists
  await expect(menuTitleElement).toHaveCount(1)

  // Prepare the menu title text
  const menuTitleElementText = await menuTitleElement.textContent()

  // Check if the tested element proper title content
  expect(menuTitleElementText).toEqual(testData.title)

  // Close the app
  await electronApp.close()
})

/**
 * Check if the main menu has a wrapper, click and check if all menu elements loaded properly
 */
test('Check if the main menu has a wrapper, click and check if all menu elements loaded properly', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const menuWrapper = appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if wrapper exists for clicking and if so, click it
  await expect(menuWrapper).toHaveCount(1)
  await menuWrapper.click()

  // Check if the amount of menu items matched the data feed
  const menuItems = appWindow.locator(`[data-test="${selectorList.menuItem}"]`)
  const dataItems = testData.data.filter(item => item.mode === 'item')
  expect(menuItems).toHaveCount(dataItems.length)

  // Close the app
  await electronApp.close()
})

/**
 * Check if the first main menu item has proper text and icon
 */
test('Check if the first main menu item has proper text and icon', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const menuWrapper = appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if wrapper exists for clicking and if so, click it
  await expect(menuWrapper).toHaveCount(1)
  await menuWrapper.click()

  // Check if the items wrappers exists and compare the amount to the data feed
  const menuItems = appWindow.locator(`[data-test="${selectorList.menuItem}"]`)
  const dataItems = testData.data.filter(item => item.mode === 'item')
  expect(menuItems).toHaveCount(dataItems.length)

  // Prepare the first menu item locators and first data item
  const firstMenuItemTextElement = menuItems.locator(`[data-test="${selectorList.menuItemText}"]`).first()
  const firstMenuItemIconElement = menuItems.locator(`[data-test="${selectorList.menuItemIcon}"]`).first()
  const firstDataItem = dataItems[0]

  // Check if the icon and text wrappers exist
  await expect(firstMenuItemTextElement).toHaveCount(1)
  await expect(firstMenuItemIconElement).toHaveCount(1)

  // Check if the first menu item has text equal to the first data item
  const firstMenuItemText = await firstMenuItemTextElement.textContent()
  const firstDataItemText = firstDataItem.text
  expect(firstMenuItemText).toBe(firstDataItemText)

  // Check if the first menu item contains an icon string equal to the first data item
  const firstMenuItemIconClassList = await firstMenuItemIconElement.evaluate(el => el.classList.value)
  const firstDataItemIcon = firstDataItem.icon as string
  expect(firstMenuItemIconClassList.includes(firstDataItemIcon)).toBe(true)

  // Close the app
  await electronApp.close()
})

/**
 * Check if text color class applied properly to any main menu item: Secondary
 */
test('Check if text color class applied properly to any main menu item: Secondary', async () => {
  const testColorName = 'secondary'
  const testColorHex = '#f75746'

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const menuWrapper = appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if wrapper exists for clicking and if so, click it
  await expect(menuWrapper).toHaveCount(1)
  await menuWrapper.click()

  // Prepare the menu item locator with the test for color string
  const colorMenuItem = appWindow.locator(`.text-${testColorName}[data-test="${selectorList.menuItem}"]`)

  // Check if the colored menu item exists
  await expect(colorMenuItem).toHaveCount(1)

  // Compare color of the string with secondary color
  const colorMenuRgb = await colorMenuItem.evaluate(el => getComputedStyle(el).getPropertyValue('color'))
  const colorMenuHex = rgbToHex(colorMenuRgb)
  expect(colorMenuHex).toBe(testColorHex)

  // Close the app
  await electronApp.close()
})

/**
 * Check if the sub-menu opens properly on click of the main menu item and all parts are loaded properly
 */
test('Check if the sub-menu opens properly on click of the main menu item and all parts are loaded properly', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const menuWrapper = appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if main menu wrapper exists for clicking and if so, click it
  await expect(menuWrapper).toHaveCount(1)
  await menuWrapper.click()

  // Wait for the menu to open
  await appWindow.waitForTimeout(600)

  // Prepare the menu item locator with the test for submenu
  const menuItems = appWindow.locator(`[data-test="${selectorList.menuItem}"]`)
  const dataElement = testData.data.filter(item => item.mode === 'item').find(el => el.submenu !== undefined)
  const dataIndex = testData.data.filter(item => item.mode === 'item').findIndex(el => el.submenu !== undefined)

  // Prepare the submenu trigger locator
  const submenuTrigger = menuItems.nth(dataIndex)

  // Check if the submenu trigger exists and click it if it does
  await expect(submenuTrigger).toHaveCount(1)
  await submenuTrigger.click()

  // Wait for the submenu to open
  await appWindow.waitForTimeout(600)

  // Prepare the submenu locator
  const subMenuWrapper = appWindow.locator(`[data-test="${selectorList.menuItemSubMenu}"]`)

  // Check if submenu wrapper doesn't exist
  await expect(subMenuWrapper).toHaveCount(1)

  // Prepare the submenu items locator and data items
  const subMenuItems = appWindow.locator(`[data-test="${selectorList.menuItemSubMenuItem}"]`)
  const dataSubmenuItems = (dataElement?.submenu !== undefined) ? dataElement.submenu.filter(item => item.mode === 'item') : false

  // Check if the submenu items count matches the data submenu items count
  const dataSubmenuItemsCount = (dataSubmenuItems) ? dataSubmenuItems.length : -1
  expect(subMenuItems).toHaveCount(dataSubmenuItemsCount)

  // Close the app
  await electronApp.close()
})

/**
 * Check if the first sub-menu item has proper text and icon
 */
test('Check if the first sub-menu item has proper text and icon', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const menuWrapper = appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if main menu wrapper exists for clicking and if so, click it
  expect(menuWrapper).toHaveCount(1)
  await menuWrapper.click()

  // Wait for the menu to open
  await appWindow.waitForTimeout(600)

  // Prepare the menu item locator with the test for submenu
  const menuItems = appWindow.locator(`[data-test="${selectorList.menuItem}"]`)
  const dataElement = testData.data.filter(item => item.mode === 'item').find(el => el.submenu !== undefined)
  const dataIndex = testData.data.filter(item => item.mode === 'item').findIndex(el => el.submenu !== undefined)
  const submenuTrigger = menuItems.nth(dataIndex)

  // Check if the submenu trigger exists and click it if it does
  await expect(submenuTrigger).toHaveCount(1)
  await submenuTrigger.click()

  // Wait for the submenu to open
  await appWindow.waitForTimeout(600)

  // Prepare the submenu locator
  const subMenuWrapper = appWindow.locator(`[data-test="${selectorList.menuItemSubMenu}"]`)

  // Check if submenu wrapper doesn't exist
  await expect(subMenuWrapper).toHaveCount(1)

  // Prepare the first sub-menu item locator and first data sub-menu item
  const firstSubMenuItem = appWindow.locator(`[data-test="${selectorList.menuItemSubMenuItem}"]`).nth(0)
  const firstDataSubmenuItem = (dataElement?.submenu !== undefined) ? dataElement.submenu.filter(item => item.mode === 'item')[0] : false as unknown as {icon: string, text: string}

  // Check if the sub-menu item wrapper exists and if the first data-item isn't false
  expect(firstSubMenuItem).toHaveCount(1)
  expect(firstDataSubmenuItem).not.toBe(false)

  // Prepare the first sub-menu item text and icon locator
  const firstSubmenuItemTextElement = firstSubMenuItem.locator(`[data-test="${selectorList.menuItemSubMenuItemText}"]`).first()
  const firstSubmenuItemIconElement = firstSubMenuItem.locator(`[data-test="${selectorList.menuItemSubMenuItemIcon}"]`).first()

  // Check if the icon and text wrappers exist
  await expect(firstSubmenuItemTextElement).toHaveCount(1)
  await expect(firstSubmenuItemIconElement).toHaveCount(1)

  // Check if the first sub-menu item has text equal to the first data item
  const firstSubmenuItemText = await firstSubmenuItemTextElement.textContent()
  const firstDataItemText = firstDataSubmenuItem.text
  expect(firstSubmenuItemText).toBe(firstDataItemText)

  // Check if the first sub-menu item contains an icon string equal to the first data item
  const firstSubmenuItemIconClassList = await firstSubmenuItemIconElement.evaluate(el => el.classList.value)
  const firstDataItemIcon = firstDataSubmenuItem.icon as string
  expect(firstSubmenuItemIconClassList.includes(firstDataItemIcon)).toBe(true)

  // Close the app
  await electronApp.close()
})

/**
 * Check if text color class applied properly to any sub-main menu item: Secondary
 */
test('Check if text color class applied properly to any sub-main menu item: Secondary', async () => {
  const testColorString = 'secondary'
  const testColorHexString = '#f75746'

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const menuWrapper = appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if main menu wrapper exists for clicking and if so, click it
  await expect(menuWrapper).toHaveCount(1)
  await menuWrapper.click()

  // Wait for the menu to open
  await appWindow.waitForTimeout(600)

  // Prepare the menu item locator with the test for submenu
  const menuItems = appWindow.locator(`[data-test="${selectorList.menuItem}"]`)
  const dataIndex = testData.data.filter(item => item.mode === 'item').findIndex(el => el.submenu !== undefined)
  const submenuTrigger = menuItems.nth(dataIndex)

  // Check if the submenu trigger exists and click it if it does
  await expect(submenuTrigger).toHaveCount(1)
  await submenuTrigger.click()

  // Wait for the submenu to open
  await appWindow.waitForTimeout(600)

  // Prepare the submenu locator
  const subMenuWrapper = appWindow.locator(`[data-test="${selectorList.menuItemSubMenu}"]`)

  // Check if submenu wrapper doesn't exist
  await expect(subMenuWrapper).toHaveCount(1)

  // Prepare the sub-menu item locator with the test for color string
  const colorSubMenuItem = appWindow.locator(`.text-${testColorString}[data-test="${selectorList.menuItemSubMenuItem}"]`)

  // Check if the colored sub-menu item wrapper exists
  expect(colorSubMenuItem).toHaveCount(1)

  // Compare color of the string with secondary color
  const colorMenuRgb = await colorSubMenuItem.evaluate(el => getComputedStyle(el).getPropertyValue('color'))
  const colorMenuHex = rgbToHex(colorMenuRgb)

  // Compare color of the string with secondary color
  expect(colorMenuHex).toBe(testColorHexString)

  // Close the app
  await electronApp.close()
})
