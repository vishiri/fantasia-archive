import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import SocialContactButtons from '../SocialContactButtons.vue'

/**
 * SocialContactButtons
 * Wrapper should expose the number of rendered single-button children via data attribute.
 */
test('Test that SocialContactButtons reports child button count on root dataset', () => {
  const w = mount(SocialContactButtons, {
    global: { mocks: { $t: (k: string) => k } }
  })

  const root = w.get('[data-test-locator="socialContactButtons"]')
  expect(root.attributes('data-test-button-number')).toBe('7')
  w.unmount()
})
