import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import MainLayout from '../MainLayout.vue'

/**
 * MainLayout
 * Renders header chrome stubs and a router outlet so the shell layout mounts without the full menu tree.
 */
test('Test that MainLayout mounts with header stubs and router-view slot', () => {
  const w = mount(MainLayout, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        AppControlMenus: {
          template: '<div data-test-stub="app-control-menus" />'
        },
        GlobalWindowButtons: {
          template: '<div data-test-stub="global-window-buttons" />'
        },
        RouterView: true
      }
    }
  })

  expect(w.find('[data-test-stub="app-control-menus"]').exists()).toBe(true)
  expect(w.find('[data-test-stub="global-window-buttons"]').exists()).toBe(true)
  expect(w.find('.appHeader').exists()).toBe(true)
  w.unmount()
})
