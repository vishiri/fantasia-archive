import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import GlobalWindowButtons from '../GlobalWindowButtons.vue'

/**
 * GlobalWindowButtons
 * Minimize click should call preload bridge when running in electron MODE.
 */
test('Test that GlobalWindowButtons minimize invokes faWindowControl in electron mode', async () => {
  vi.stubEnv('MODE', 'electron')
  const w = mount(GlobalWindowButtons, {
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="globalWindowButtons-button-minimize"]').trigger('click')
  expect(window.faContentBridgeAPIs.faWindowControl.minimizeWindow).toHaveBeenCalled()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * GlobalWindowButtons
 * Renders three titled window controls for accessibility hooks.
 */
test('Test that GlobalWindowButtons exposes minimize, resize, and close controls', () => {
  const w = mount(GlobalWindowButtons, {
    global: { mocks: { $t: (k: string) => k } }
  })

  expect(w.find('[data-test-locator="globalWindowButtons-button-minimize"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="globalWindowButtons-button-resize"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="globalWindowButtons-button-close"]').exists()).toBe(true)
  w.unmount()
})
