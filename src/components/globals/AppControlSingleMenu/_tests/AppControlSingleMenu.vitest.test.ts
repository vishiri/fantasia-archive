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
 * Rows without nested menus ignore pointer enter or leave for submenu hover logic (early return paths).
 */
test('Test that menu row hover handlers no-op when the row has no submenu', async () => {
  const w = mount(AppControlSingleMenu, {
    attachTo: document.body,
    props: { dataInput: minimalMenu },
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="AppControlSingleMenu-wrapper"]').trigger('click')
  await flushPromises()

  const row = document.body.querySelector('[data-test-locator="AppControlSingleMenu-menuItem"]')
  expect(row).not.toBeNull()
  ;(row as HTMLElement).dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
  ;(row as HTMLElement).dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
  await flushPromises()

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
 * The first item omits separatorAlt above it; after a full-width separator row, the next item must not get a second thin line.
 */
test('Test that AppControlSingleMenu omits separatorAlt above the first item and after a separator row', async () => {
  const w = mount(AppControlSingleMenu, {
    attachTo: document.body,
    props: {
      dataInput: {
        title: 'Menu',
        data: [
          {
            mode: 'item',
            text: 'First',
            icon: 'mdi-numeric-1',
            conditions: true
          },
          { mode: 'separator' },
          {
            mode: 'item',
            text: 'After sep',
            icon: 'mdi-numeric-2',
            conditions: true
          }
        ]
      }
    },
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="AppControlSingleMenu-wrapper"]').trigger('click')
  await flushPromises()

  const alt = document.body.querySelectorAll('.appControlSingleMenu__separatorAlt')
  const standard = document.body.querySelectorAll('.appControlSingleMenu__separator')
  expect(alt.length).toBe(0)
  expect(standard.length).toBe(1)
  w.unmount()
})

/**
 * AppControlSingleMenu
 * Consecutive items get a thin separator before the second and later rows only.
 */
test('Test that AppControlSingleMenu renders separatorAlt between two item rows without a full separator', async () => {
  const w = mount(AppControlSingleMenu, {
    attachTo: document.body,
    props: {
      dataInput: {
        title: 'Menu',
        data: [
          {
            mode: 'item',
            text: 'First',
            icon: 'mdi-numeric-1',
            conditions: true
          },
          {
            mode: 'item',
            text: 'Second',
            icon: 'mdi-numeric-2',
            conditions: true
          }
        ]
      }
    },
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="AppControlSingleMenu-wrapper"]').trigger('click')
  await flushPromises()

  expect(document.body.querySelectorAll('.appControlSingleMenu__separatorAlt').length).toBe(1)
  expect(document.body.querySelectorAll('.appControlSingleMenu__separator').length).toBe(0)
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
            keybindCommandId: 'openAppSettings',
            mode: 'item',
            text: 'App settings',
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
    commandId: 'openAppSettings',
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
 * AppControlSingleMenu
 * Submenu rows render `secondaryHintText` with the shortcut-hint typography when provided.
 */
test('Test that AppControlSingleMenu shows submenu secondary hint text when configured', async () => {
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
                mode: 'item',
                secondaryHintText: 'D:\\projects\\mine.faproject',
                text: 'Mine project',
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

  const secondary = document.body.querySelector(
    '[data-test-locator="AppControlSingleMenu-menuItem-subMenu-item-secondaryHint"]'
  )
  expect(secondary).not.toBeNull()
  expect(secondary?.textContent?.trim()).toBe('D:\\projects\\mine.faproject')
  expect(document.body.querySelectorAll('[data-test-locator="AppControlSingleMenu-menuItem-subMenu-item-keybind"]').length)
    .toBe(0)
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

/**
 * AppControlSingleMenu
 * Omits the trailing submenu icon stack when the model leaves `icon` unset.
 */
test('Test that AppControlSingleMenu hides submenu avatar icon when icon is absent', async () => {
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
                mode: 'item',
                text: 'Text only row'
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

  expect(
    document.body.querySelector(
      '[data-test-locator="AppControlSingleMenu-menuItem-subMenu-item-icon"]'
    )
  ).toBeNull()

  w.unmount()
})
