import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { expect, test, vi } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

const bindSplashPageSkipWelcomeScreenLifecycleMock = vi.hoisted(() => {
  return vi.fn()
})

vi.mock('app/src/pages/scripts/splashPageSkipWelcomeScreen', () => {
  return {
    bindSplashPageSkipWelcomeScreenLifecycle: bindSplashPageSkipWelcomeScreenLifecycleMock
  }
})

import SplashPage from '../SplashPage.vue'

function mountSplashPageWithSettings (settings: I_faUserSettings | null): ReturnType<typeof mount> {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = S_FaUserSettings()
  store.settings = settings

  return mount(SplashPage, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (key: string) => key
      }
    }
  })
}

/**
 * SplashPage
 * Startup welcome screen: title row, primary actions, and social buttons block.
 */
test('Test that SplashPage renders title row, primary actions, and social buttons', async () => {
  bindSplashPageSkipWelcomeScreenLifecycleMock.mockClear()

  const w = mountSplashPageWithSettings({
    ...FA_USER_SETTINGS_DEFAULTS,
    hideWelcomeScreenSocials: false
  })

  await flushPromises()

  expect(w.find('[data-test-locator="splashPage"]').exists()).toBe(true)
  expect(w.get('[data-test-locator="splashPage-title"]').text()).toBe('splashPage.title')

  expect(w.find('[data-test-locator="splashPage-btn-resume-latest"]').exists()).toBe(false)
  expect(w.find('[data-test-locator="splashPage-btn-new"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="splashPage-btn-load"]').exists()).toBe(true)

  expect(w.find('[data-test-locator="splashPage-socialSeparator"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="socialContactButtons"]').exists()).toBe(true)
  expect(bindSplashPageSkipWelcomeScreenLifecycleMock).toHaveBeenCalled()

  w.unmount()
})

/**
 * SplashPage
 * hideWelcomeScreenSocials from S_FaUserSettings hides the divider and social contact rows.
 */
test('Test that SplashPage hides social separator and buttons when hideWelcomeScreenSocials is true', async () => {
  const w = mountSplashPageWithSettings({
    ...FA_USER_SETTINGS_DEFAULTS,
    hideWelcomeScreenSocials: true
  })

  await flushPromises()

  expect(w.find('[data-test-locator="splashPage-btn-new"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="splashPage-socialSeparator"]').exists()).toBe(false)
  expect(w.find('[data-test-locator="socialContactButtons"]').exists()).toBe(false)

  w.unmount()
})

/**
 * SplashPage
 * Reactively shows social chrome when hideWelcomeScreenSocials flips off in the store.
 */
test('Test that SplashPage reveals social chrome when hideWelcomeScreenSocials becomes false', async () => {
  const w = mountSplashPageWithSettings({
    ...FA_USER_SETTINGS_DEFAULTS,
    hideWelcomeScreenSocials: true
  })

  await flushPromises()
  expect(w.find('[data-test-locator="socialContactButtons"]').exists()).toBe(false)

  S_FaUserSettings().settings = {
    ...FA_USER_SETTINGS_DEFAULTS,
    hideWelcomeScreenSocials: false
  }
  await flushPromises()

  expect(w.find('[data-test-locator="splashPage-socialSeparator"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="socialContactButtons"]').exists()).toBe(true)

  w.unmount()
})
