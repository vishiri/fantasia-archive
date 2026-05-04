import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import SplashPage from '../SplashPage.vue'

/**
 * SplashPage
 * Startup welcome screen: title row, three primary actions, and social buttons block.
 */
test('Test that SplashPage renders title row, primary actions, and social buttons', () => {
  const w = mount(SplashPage, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('[data-test-locator="splashPage"]').exists()).toBe(true)
  expect(w.get('[data-test-locator="splashPage-title"]').text()).toBe('splashPage.title')

  expect(w.find('[data-test-locator="splashPage-btn-resume"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="splashPage-btn-new"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="splashPage-btn-load"]').exists()).toBe(true)

  expect(w.find('[data-test-locator="socialContactButtons"]').exists()).toBe(true)

  w.unmount()
})
