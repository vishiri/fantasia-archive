import { flushPromises, mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import type { I_appMenuList } from 'app/types/I_appMenusDataList'

import AppControlSingleMenu from '../AppControlSingleMenu.vue'

const minimalMenu: I_appMenuList = {
  title: 'Unit menu',
  data: [
    {
      mode: 'item',
      text: 'Item one',
      icon: 'mdi-numeric-1',
      conditions: true
    }
  ]
}

/**
 * AppControlSingleMenu
 * Structured prop data should render a titled trigger; first item label appears after opening the Quasar menu (teleported to document.body).
 */
test('Test that AppControlSingleMenu renders menu title and first item text from dataInput', async () => {
  const w = mount(AppControlSingleMenu, {
    attachTo: document.body,
    props: { dataInput: minimalMenu },
    global: { mocks: { $t: (k: string) => k } }
  })

  expect(w.get('[data-test-locator="AppControlSingleMenu-title"]').text()).toBe('Unit menu')

  await w.get('[data-test-locator="AppControlSingleMenu-wrapper"]').trigger('click')
  await flushPromises()

  const menuTexts = document.body.querySelectorAll(
    '[data-test-locator="AppControlSingleMenu-menuItem-text"]'
  )
  expect(menuTexts.length).toBeGreaterThan(0)
  expect(menuTexts[0]?.textContent?.trim()).toBe('Item one')
  expect(document.body.querySelectorAll('[data-test-locator="AppControlSingleMenu-menuItem-keybind"]').length)
    .toBe(0)
  w.unmount()
})

/**
 * AppControlSingleMenu
 * Rows without `keybindCommandId` must not render shortcut hint nodes.
 */
test('Test that AppControlSingleMenu omits keybind hint markup when keybindCommandId is absent', async () => {
  const w = mount(AppControlSingleMenu, {
    attachTo: document.body,
    props: { dataInput: minimalMenu },
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="AppControlSingleMenu-wrapper"]').trigger('click')
  await flushPromises()

  expect(document.body.querySelectorAll('[data-test-locator="AppControlSingleMenu-menuItem-keybind"]').length)
    .toBe(0)
  expect(document.body.querySelectorAll('.appControlSingleMenu__keybindText').length).toBe(0)
  w.unmount()
})

/**
 * AppControlSingleMenu
 * When `keybindCommandId` is set and `S_FaKeybinds.snapshot` is loaded, the hint matches the shared formatter.
 */
test('Test that AppControlSingleMenu shows keybind hint from S_FaKeybinds snapshot', async () => {
  const keybinds = S_FaKeybinds()
  keybinds.snapshot = {
    platform: 'win32',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  }

  const w = mount(AppControlSingleMenu, {
    attachTo: document.body,
    props: {
      dataInput: {
        title: 'T',
        data: [
          {
            conditions: true,
            icon: 'mdi-tune',
            keybindCommandId: 'openProgramSettings',
            mode: 'item',
            text: 'Program settings',
            trigger: vi.fn()
          }
        ]
      }
    },
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="AppControlSingleMenu-wrapper"]').trigger('click')
  await flushPromises()

  const hint = document.body.querySelector('[data-test-locator="AppControlSingleMenu-menuItem-keybind"]')
  expect(hint).not.toBeNull()
  const expectedLabel = formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'openProgramSettings',
    snapshot: keybinds.snapshot
  })
  expect(hint?.textContent?.trim()).toBe(`(${expectedLabel})`)
  w.unmount()
})

/**
 * AppControlSingleMenu
 * Submenu rows respect `keybindCommandId` when snapshot is present.
 */
test('Test that AppControlSingleMenu shows submenu keybind hint when configured', async () => {
  const keybinds = S_FaKeybinds()
  keybinds.snapshot = {
    platform: 'win32',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  }

  const w = mount(AppControlSingleMenu, {
    attachTo: document.body,
    props: {
      dataInput: {
        title: 'T',
        data: [
          {
            conditions: true,
            icon: 'keyboard_arrow_right',
            mode: 'item',
            submenu: [
              {
                conditions: true,
                icon: 'mdi-check',
                keybindCommandId: 'openKeybindSettings',
                mode: 'item',
                text: 'Nested',
                trigger: vi.fn()
              }
            ],
            text: 'Parent',
            trigger: undefined
          }
        ]
      }
    },
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="AppControlSingleMenu-wrapper"]').trigger('click')
  await flushPromises()

  const parentRow = document.body.querySelector('[data-test-locator="AppControlSingleMenu-menuItem"]')
  expect(parentRow).not.toBeNull()
  ;(parentRow as HTMLElement).dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
  await flushPromises()

  const subHint = document.body.querySelector(
    '[data-test-locator="AppControlSingleMenu-menuItem-subMenu-item-keybind"]'
  )
  expect(subHint).not.toBeNull()
  const expectedSubLabel = formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'openKeybindSettings',
    snapshot: keybinds.snapshot
  })
  expect(subHint?.textContent?.trim()).toBe(`(${expectedSubLabel})`)
  w.unmount()
})

/**
 * Parent menus pass fresh I_appMenuList instances when locale changes; the trigger label must update.
 */
test('Test that AppControlSingleMenu menu title updates when dataInput title changes', async () => {
  const w = mount(AppControlSingleMenu, {
    props: {
      dataInput: {
        data: minimalMenu.data,
        title: 'First title'
      }
    },
    global: { mocks: { $t: (k: string) => k } }
  })

  expect(w.get('[data-test-locator="AppControlSingleMenu-title"]').text()).toBe('First title')

  await w.setProps({
    dataInput: {
      data: minimalMenu.data,
      title: 'Second title'
    }
  })

  expect(w.get('[data-test-locator="AppControlSingleMenu-title"]').text()).toBe('Second title')
  w.unmount()
})

/**
 * AppControlSingleMenu
 * Item clicks should invoke trigger with spread triggerArguments when both are present.
 */
test('Test that AppControlSingleMenu passes triggerArguments into the menu item trigger', async () => {
  const trigger = vi.fn()
  const w = mount(AppControlSingleMenu, {
    attachTo: document.body,
    props: {
      dataInput: {
        title: 'T',
        data: [
          {
            mode: 'item',
            text: 'Run',
            icon: 'mdi-play',
            conditions: true,
            trigger,
            triggerArguments: ['alpha', 2]
          }
        ]
      }
    },
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="AppControlSingleMenu-wrapper"]').trigger('click')
  await flushPromises()

  const rows = document.body.querySelectorAll('[data-test-locator="AppControlSingleMenu-menuItem"]')
  expect(rows.length).toBeGreaterThan(0)
  ;(rows[rows.length - 1] as HTMLElement).click()
  await flushPromises()

  expect(trigger).toHaveBeenCalledTimes(1)
  expect(trigger).toHaveBeenCalledWith('alpha', 2)
  w.unmount()
})

/**
 * AppControlSingleMenu
 * Item clicks should call trigger with no arguments when triggerArguments is absent.
 */
test('Test that AppControlSingleMenu calls trigger without arguments when triggerArguments is omitted', async () => {
  const trigger = vi.fn()
  const w = mount(AppControlSingleMenu, {
    attachTo: document.body,
    props: {
      dataInput: {
        title: 'T',
        data: [
          {
            mode: 'item',
            text: 'Run',
            icon: 'mdi-play',
            conditions: true,
            trigger
          }
        ]
      }
    },
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="AppControlSingleMenu-wrapper"]').trigger('click')
  await flushPromises()

  const rows = document.body.querySelectorAll('[data-test-locator="AppControlSingleMenu-menuItem"]')
  expect(rows.length).toBeGreaterThan(0)
  ;(rows[rows.length - 1] as HTMLElement).click()
  await flushPromises()

  expect(trigger).toHaveBeenCalledTimes(1)
  expect(trigger).toHaveBeenCalledWith()
  w.unmount()
})

/**
 * AppControlSingleMenu
 * Submenu item clicks should invoke submenu triggers when defined.
 */
test('Test that AppControlSingleMenu invokes submenu item trigger on nested row click', async () => {
  const subTrigger = vi.fn()
  const w = mount(AppControlSingleMenu, {
    attachTo: document.body,
    props: {
      dataInput: {
        title: 'T',
        data: [
          {
            conditions: true,
            icon: 'keyboard_arrow_right',
            mode: 'item',
            submenu: [
              {
                conditions: true,
                icon: 'mdi-check',
                mode: 'item',
                text: 'Nested',
                trigger: subTrigger
              }
            ],
            text: 'Parent',
            trigger: undefined
          }
        ]
      }
    },
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="AppControlSingleMenu-wrapper"]').trigger('click')
  await flushPromises()

  const nestedRows = document.body.querySelectorAll(
    '[data-test-locator="AppControlSingleMenu-menuItem-subMenu-item"]'
  )
  expect(nestedRows.length).toBeGreaterThan(0)
  ;(nestedRows[nestedRows.length - 1] as HTMLElement).click()
  await flushPromises()

  expect(subTrigger).toHaveBeenCalledTimes(1)
  w.unmount()
})

/**
 * AppControlSingleMenu
 * Submenu item clicks should not throw when the nested row omits a trigger (expression falls back to false).
 */
test('Test that AppControlSingleMenu submenu item click tolerates a missing trigger', async () => {
  const w = mount(AppControlSingleMenu, {
    attachTo: document.body,
    props: {
      dataInput: {
        title: 'T',
        data: [
          {
            conditions: true,
            icon: 'keyboard_arrow_right',
            mode: 'item',
            submenu: [
              {
                conditions: true,
                icon: 'mdi-dots-horizontal',
                mode: 'item',
                text: 'No trigger row'
              }
            ],
            text: 'Parent',
            trigger: undefined
          }
        ]
      }
    },
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="AppControlSingleMenu-wrapper"]').trigger('click')
  await flushPromises()

  const parentRow = document.body.querySelector('[data-test-locator="AppControlSingleMenu-menuItem"]')
  expect(parentRow).not.toBeNull()
  ;(parentRow as HTMLElement).dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
  await flushPromises()

  const nestedRows = document.body.querySelectorAll(
    '[data-test-locator="AppControlSingleMenu-menuItem-subMenu-item"]'
  )
  expect(nestedRows.length).toBeGreaterThan(0)
  expect(() => {
    ;(nestedRows[nestedRows.length - 1] as HTMLElement).click()
  }).not.toThrow()

  w.unmount()
})
