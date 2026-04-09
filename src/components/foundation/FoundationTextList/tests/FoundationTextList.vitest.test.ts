import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FoundationTextList from '../FoundationTextList.vue'

/**
 * FoundationTextList
 * Renders Storybook-only Quasar typography reference rows.
 */
test('FoundationTextList exposes root locator and key typography sections', () => {
  const w = mount(FoundationTextList)

  expect(w.find('[data-test-locator="foundationTextList"]').exists()).toBe(true)
  expect(w.text()).toContain('Typography foundation')
  expect(w.text()).toContain('Type scale')
  expect(w.text()).toContain('text-h1')
  expect(w.text()).toContain('Font weights')
  expect(w.text()).toContain('text-weight-bold')
  expect(w.text()).toContain('Text helper classes')
  expect(w.text()).toContain('text-center')

  w.unmount()
})
