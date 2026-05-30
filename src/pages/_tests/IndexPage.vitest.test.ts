import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import IndexPage from '../IndexPage/IndexPage.vue'

/**
 * IndexPage
 * Mounts the workspace home shell with the project overview block.
 */
test('Test that IndexPage renders ProjectOverview inside the main wrapper', () => {
  const wrapper = mount(IndexPage, {
    global: {
      stubs: {
        ProjectOverview: {
          template: '<div data-test-locator="projectOverview-stub" />'
        }
      }
    }
  })

  expect(wrapper.find('main.indexPage').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator=projectOverview-stub]').exists()).toBe(true)

  wrapper.unmount()
})
