import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import { helpInfo } from '../_data/helpInfo'
import { tools } from '../_data/tools'
import AppControlMenus from '../AppControlMenus.vue'

/**
 * helpInfo and tools menu data
 * Triggers are plain callables wired to dialog and markdown helpers; they should not throw with Vitest Pinia active.
 */
test('Test that helpInfo and tools menu item triggers run without throwing', () => {
  for (const entry of [...helpInfo.data, ...tools.data]) {
    if (entry.mode === 'item' && typeof entry.trigger === 'function') {
      expect(() => entry.trigger?.()).not.toThrow()
    }
  }
})

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
