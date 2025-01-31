import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/customContentBridgeAPIs/extraEnvVariablesAPI'
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

  const menuWrapperElement = await appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if the tested element exists
  if (menuWrapperElement !== null) {
    const hasProperInput = await menuWrapperElement.evaluate(el => !!el.dataset.testHasProperDataInput)

    await expect(hasProperInput).toBe(true)
    await electronApp.close()
  } else {
    // Element doesn't exist
    test.fail()
  }
})

/**
 * Load a custom "Test Title" menu button in the menu and check if it loaded
 */
test('Check if the "Menu title" element is properly loaded and has proper content in it', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  const menuTitleElement = await appWindow.locator(`[data-test="${selectorList.menuTitle}"]`)
  const menuTitleElementText = (menuTitleElement !== null) ? await menuTitleElement.textContent() : ''

  // Check if the tested element exists and has proper title content
  if (menuTitleElement !== null && menuTitleElementText === testData.title) {
    await expect(true).toBe(true)
    await electronApp.close()
  } else {
    // Element doesn't exist OR lacks proper title in it
    test.fail()
  }
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

  const menuWrapper = await appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if wrapper exists for clicking and if so, click it
  if (menuWrapper !== null) {
    await menuWrapper.click()

    const menuItems = await appWindow.$$(`[data-test="${selectorList.menuItem}"]`)
    const dataItems = testData.data.filter(item => item.mode === 'item')

    // Check if element feed matched the data feed
    await expect(menuItems.length === dataItems.length).toBe(true)
    await electronApp.close()
  } else {
    // Wrapper for opening the menu doesn't exist
    test.fail()
  }
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

  const menuWrapper = await appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if wrapper exists for clicking and if so, click it
  if (menuWrapper !== null) {
    await menuWrapper.click()

    const firstMenuItem = await appWindow.locator(`[data-test="${selectorList.menuItem}"]`)
    const firstDataItem = testData.data.filter(item => item.mode === 'item')[0]

    // Check if the item wrapper exists
    if (firstMenuItem !== null) {
      const firstMenuItemTextElement = await firstMenuItem.locator(`[data-test="${selectorList.menuItemText}"]`).nth(0)
      const firstMenuItemIconElement = await firstMenuItem.locator(`[data-test="${selectorList.menuItemIcon}"]`).nth(0)

      // Check if the icon and text wrappers exist
      if (firstMenuItemTextElement !== null && firstMenuItemIconElement !== null) {
        const firstMenuItemText = await firstMenuItemTextElement.textContent()
        const firstDataItemText = firstDataItem.text

        const firstMenuItemIconClassObject = await firstMenuItemIconElement.evaluate(el => el.classList)
        const firstMenuItemIconClassList = Object.values(firstMenuItemIconClassObject).concat()
        const firstDataItemIcon = firstDataItem.icon as string

        await expect(firstMenuItemText === firstDataItemText && firstMenuItemIconClassList.includes(firstDataItemIcon)).toBe(true)
        await electronApp.close()
      } else {
        // Item text or icon wrappers don't exist
        test.fail()
      }
    } else {
      // Item wrapper doesn't exist
      test.fail()
    }
  } else {
    // Wrapper for opening the menu doesn't exist
    test.fail()
  }
})

/**
 * Check if text color class applied properly to any main menu item: Secondary
 */
test('Check if text color class applied properly to any main menu item: Secondary', async () => {
  const testColorString = 'secondary'
  const testColorHexString = '#f75746'

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  const menuWrapper = await appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if wrapper exists for clicking and if so, click it
  if (menuWrapper !== null) {
    await menuWrapper.click()

    const colorMenuItem = await appWindow.locator(`.text-${testColorString}[data-test="${selectorList.menuItem}"]`)

    // Check if the item wrapper exists
    if (colorMenuItem !== null) {
      const colorMenuString = await colorMenuItem.evaluate(el => getComputedStyle(el).getPropertyValue('color'))
      const colorHexString = rgbToHex(colorMenuString)

      // Compare color of the string with secondary color
      await expect(colorHexString).toBe(testColorHexString)
      await electronApp.close()
    } else {
      // Item wrapper doesn't exist
      test.fail()
    }
  } else {
    // Wrapper for opening the menu doesn't exist
    test.fail()
  }
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

  const menuWrapper = await appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if main menu wrapper exists for clicking and if so, click it
  if (menuWrapper !== null) {
    await menuWrapper.click()
    await appWindow.waitForTimeout(600)

    const menuItems = await appWindow.$$(`[data-test="${selectorList.menuItem}"]`)
    const dataElement = testData.data.filter(item => item.mode === 'item').find(el => el.submenu !== undefined)
    const dataIndex = testData.data.filter(item => item.mode === 'item').findIndex(el => el.submenu !== undefined)

    const submenuTrigger = menuItems[dataIndex]

    // Check if the submenu trigger exists and click it if it does
    if (submenuTrigger !== null) {
      await submenuTrigger.click()
      await appWindow.waitForTimeout(600)
    } else {
      // Submenu trigger doesn't exist
      test.fail()
    }

    const subMenuWrapper = await appWindow.locator(`[data-test="${selectorList.menuItemSubMenu}"]`)

    // Check if submenu wrapper doesn't exist
    if (subMenuWrapper === null) {
      test.fail()
    }

    const subMenuItems = await appWindow.$$(`[data-test="${selectorList.menuItemSubMenuItem}"]`)
    const dataSubmenuItems = (dataElement?.submenu !== undefined) ? dataElement.submenu.filter(item => item.mode === 'item') : false

    const subMenuItemsCount = subMenuItems.length
    const dataSubmenuItemsCount = (dataSubmenuItems) ? dataSubmenuItems.length : false

    await expect(subMenuItemsCount === dataSubmenuItemsCount).toBe(true)
    await electronApp.close()
  } else {
    // Wrapper for opening the main menu doesn't exist
    test.fail()
  }
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

  const menuWrapper = await appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if main menu wrapper exists for clicking and if so, click it
  if (menuWrapper !== null) {
    await menuWrapper.click()
    await appWindow.waitForTimeout(600)

    const menuItems = await appWindow.$$(`[data-test="${selectorList.menuItem}"]`)
    const dataElement = testData.data.filter(item => item.mode === 'item').find(el => el.submenu !== undefined)
    const dataIndex = testData.data.filter(item => item.mode === 'item').findIndex(el => el.submenu !== undefined)

    const submenuTrigger = menuItems[dataIndex]

    // Check if the submenu trigger exists and click it if it does
    if (submenuTrigger !== null) {
      await submenuTrigger.click()
      await appWindow.waitForTimeout(600)
    } else {
      // Submenu trigger doesn't exist
      test.fail()
    }

    const subMenuWrapper = await appWindow.locator(`[data-test="${selectorList.menuItemSubMenu}"]`)

    // Check if submenu wrapper doesn't exist
    if (subMenuWrapper === null) {
      test.fail()
    }

    const firstSubMenuItem = await appWindow.locator(`[data-test="${selectorList.menuItemSubMenuItem}"]`)
    const firstDataSubmenuItem = (dataElement?.submenu !== undefined) ? dataElement.submenu.filter(item => item.mode === 'item')[0] : false

    // Check if the sub-menu item wrapper exists and if the first data-item isn't false
    if (firstSubMenuItem !== null && firstDataSubmenuItem) {
      const firstSubmenuItemTextElement = await firstSubMenuItem.locator(`[data-test="${selectorList.menuItemSubMenuItemText}"]`).nth(0)
      const firstSubmenuItemIconElement = await firstSubMenuItem.locator(`[data-test="${selectorList.menuItemSubMenuItemIcon}"]`).nth(0)

      // Check if the icon and text wrappers exist
      if (firstSubmenuItemTextElement !== null && firstSubmenuItemIconElement !== null) {
        const firstSubmenuItemText = await firstSubmenuItemTextElement.textContent()
        const firstDataItemText = firstDataSubmenuItem.text

        const firstSubmenuItemIconClassObject = await firstSubmenuItemIconElement.evaluate(el => el.classList)
        const firstSubmenuItemIconClassList = Object.values(firstSubmenuItemIconClassObject).concat()
        const firstDataItemIcon = firstDataSubmenuItem.icon as string

        await expect(firstSubmenuItemText === firstDataItemText && firstSubmenuItemIconClassList.includes(firstDataItemIcon)).toBe(true)
        await electronApp.close()
      } else {
        // Item text or icon wrappers don't exist
        test.fail()
      }
    } else {
      // Item wrapper doesn't exist
      test.fail()
    }

    await electronApp.close()
  } else {
    // Wrapper for opening the main menu doesn't exist
    test.fail()
  }
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

  const menuWrapper = await appWindow.locator(`[data-test="${selectorList.menuWrapper}"]`)

  // Check if main menu wrapper exists for clicking and if so, click it
  if (menuWrapper !== null) {
    await menuWrapper.click()
    await appWindow.waitForTimeout(600)

    const menuItems = await appWindow.$$(`[data-test="${selectorList.menuItem}"]`)
    const dataIndex = testData.data.filter(item => item.mode === 'item').findIndex(el => el.submenu !== undefined)

    const submenuTrigger = menuItems[dataIndex]

    // Check if the submenu trigger exists and click it if it does
    if (submenuTrigger !== null) {
      await submenuTrigger.click()
      await appWindow.waitForTimeout(600)
    } else {
      // Submenu trigger doesn't exist
      test.fail()
    }

    const subMenuWrapper = await appWindow.locator(`[data-test="${selectorList.menuItemSubMenu}"]`)

    // Check if submenu wrapper doesn't exist
    if (subMenuWrapper === null) {
      test.fail()
    }

    const colorSubMenuItem = await appWindow.locator(`.text-${testColorString}[data-test="${selectorList.menuItemSubMenuItem}"]`)

    // Check if the colored sub-menu item wrapper exists
    if (colorSubMenuItem !== null) {
      const colorMenuString = await colorSubMenuItem.evaluate(el => getComputedStyle(el).getPropertyValue('color'))
      const colorHexString = rgbToHex(colorMenuString)

      // Compare color of the string with secondary color
      await expect(colorHexString).toBe(testColorHexString)
      await electronApp.close()
    } else {
      // Item wrapper doesn't exist
      test.fail()
    }

    await electronApp.close()
  } else {
    // Wrapper for opening the main menu doesn't exist
    test.fail()
  }
})
