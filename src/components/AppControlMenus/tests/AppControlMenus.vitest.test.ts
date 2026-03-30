import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import AppControlMenus from '../AppControlMenus.vue'

/**
 * AppControlMenus
 * Shell layout class should mount for standard env wiring (non-component tests).
 */
test('Test that AppControlMenus renders host layout class', () => {
  const w = mount(AppControlMenus, {
    global: { mocks: { $t: (k: string) => k } }
  })

  expect(w.find('.appControlMenus').exists()).toBe(true)
  w.unmount()
})
