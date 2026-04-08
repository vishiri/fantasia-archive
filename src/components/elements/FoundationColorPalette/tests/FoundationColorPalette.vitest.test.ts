import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FoundationColorPalette from '../FoundationColorPalette.vue'

/**
 * FoundationColorPalette
 * Renders Storybook-only swatches for theme tokens and Quasar material class stems.
 */
test('FoundationColorPalette exposes root locator and key palette sections', () => {
  const w = mount(FoundationColorPalette)

  expect(w.find('[data-test-locator="foundationColorPalette"]').exists()).toBe(true)
  expect(w.text()).toContain('$primary')
  expect(w.text()).toContain('Custom theme colors')
  expect(w.text()).toContain('Default Quasar material palette')
  expect(w.text()).toContain('red')
  expect(w.text()).toContain('blue-grey-14')

  w.unmount()
})
