import { flushPromises, mount } from '@vue/test-utils'
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
  await flushPromises()
  expect(window.faContentBridgeAPIs.faWindowControl.minimizeWindow).toHaveBeenCalled()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * GlobalWindowButtons
 * Renders three window controls with data-test-locator hooks.
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

/**
 * GlobalWindowButtons
 * Resize click should call resizeWindow and refresh maximized state in electron MODE.
 */
test('Test that GlobalWindowButtons resize invokes faWindowControl in electron mode', async () => {
  vi.stubEnv('MODE', 'electron')
  const w = mount(GlobalWindowButtons, {
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="globalWindowButtons-button-resize"]').trigger('click')
  await flushPromises()
  expect(window.faContentBridgeAPIs.faWindowControl.resizeWindow).toHaveBeenCalled()
  expect(window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized).toHaveBeenCalled()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * GlobalWindowButtons
 * Close click should call closeWindow when running in electron MODE.
 */
test('Test that GlobalWindowButtons close invokes faWindowControl in electron mode', async () => {
  vi.stubEnv('MODE', 'electron')
  const w = mount(GlobalWindowButtons, {
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="globalWindowButtons-button-close"]').trigger('click')
  await flushPromises()
  expect(window.faContentBridgeAPIs.faWindowControl.closeWindow).toHaveBeenCalled()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * GlobalWindowButtons
 * Window controls should no-op the preload bridge when MODE is not electron.
 */
test('Test that GlobalWindowButtons minimize does not invoke faWindowControl when MODE is not electron', async () => {
  vi.stubEnv('MODE', 'spa')
  const w = mount(GlobalWindowButtons, {
    global: { mocks: { $t: (k: string) => k } }
  })

  await w.get('[data-test-locator="globalWindowButtons-button-minimize"]').trigger('click')
  await flushPromises()
  expect(window.faContentBridgeAPIs.faWindowControl.minimizeWindow).not.toHaveBeenCalled()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * GlobalWindowButtons
 * Mounted interval should periodically refresh maximized state in electron MODE.
 */
test('Test that GlobalWindowButtons interval invokes checkWindowMaximized on a timer tick', async () => {
  vi.stubEnv('MODE', 'electron')
  vi.useFakeTimers()
  const w = mount(GlobalWindowButtons, {
    global: { mocks: { $t: (k: string) => k } }
  })

  await flushPromises()
  const checkMax = vi.mocked(window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized)
  const callsAfterMount = checkMax.mock.calls.length

  await vi.advanceTimersByTimeAsync(100)
  await flushPromises()

  expect(checkMax.mock.calls.length).toBeGreaterThan(callsAfterMount)
  w.unmount()
  vi.useRealTimers()
  vi.unstubAllEnvs()
})
