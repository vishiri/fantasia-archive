import { flushPromises, mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

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

  const row = document.body.querySelector('[data-test-locator="AppControlSingleMenu-menuItem"]')
  expect(row).not.toBeNull()
  ;(row as HTMLElement).click()
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

  const row = document.body.querySelector('[data-test-locator="AppControlSingleMenu-menuItem"]')
  expect(row).not.toBeNull()
  ;(row as HTMLElement).click()
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

  const nested = document.body.querySelector(
    '[data-test-locator="AppControlSingleMenu-menuItem-subMenu-item"]'
  )
  expect(nested).not.toBeNull()
  ;(nested as HTMLElement).click()
  await flushPromises()

  expect(subTrigger).toHaveBeenCalledTimes(1)
  w.unmount()
})
