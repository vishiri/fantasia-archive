import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { expect, test, vi } from 'vitest'

import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

import GlobalLanguageSelector from '../GlobalLanguageSelector.vue'

/**
 * GlobalLanguageSelector
 * Hidden when MODE is not electron even if the user-settings bridge exists.
 */
test('Test that GlobalLanguageSelector does not render when MODE is not electron', () => {
  vi.stubEnv('MODE', 'spa')
  setActivePinia(createPinia())
  const w = mount(GlobalLanguageSelector, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('.globalLanguageSelector').exists()).toBe(false)
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * GlobalLanguageSelector
 * Renders the trigger in electron MODE with user-settings bridge present.
 */
test('Test that GlobalLanguageSelector exposes the menu trigger in electron mode', async () => {
  vi.stubEnv('MODE', 'electron')
  setActivePinia(createPinia())
  const store = S_FaUserSettings()
  await store.refreshSettings()

  const w = mount(GlobalLanguageSelector, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('[data-test-locator="globalLanguageSelector-trigger"]').exists()).toBe(true)
  w.unmount()
  vi.unstubAllEnvs()
})
