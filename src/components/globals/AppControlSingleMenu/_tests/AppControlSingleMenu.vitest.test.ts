import { flushPromises, mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

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
