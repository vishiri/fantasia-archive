import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FaCornerContentDot from '../FaCornerContentDot.vue'

/**
 * FaCornerContentDot
 * Renders absolute presence badge when visible is true.
 */
test('Test that FaCornerContentDot renders locator when visible', () => {
  const wrapper = mount(FaCornerContentDot, {
    props: {
      locator: 'faCornerContentDot-test',
      visible: true
    }
  })

  expect(wrapper.find('[data-test-locator="faCornerContentDot-test"]').exists()).toBe(true)
  expect(wrapper.find('.faCornerContentDot').exists()).toBe(true)

  wrapper.unmount()
})

/**
 * FaCornerContentDot
 * Omits badge markup when visible is false.
 */
test('Test that FaCornerContentDot hides when not visible', () => {
  const wrapper = mount(FaCornerContentDot, {
    props: {
      locator: 'faCornerContentDot-hidden',
      visible: false
    }
  })

  expect(wrapper.find('[data-test-locator="faCornerContentDot-hidden"]').exists()).toBe(false)

  wrapper.unmount()
})
