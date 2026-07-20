/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test } from 'vitest'

import ProjectHierarchyTreeOrderNumberBadge from '../ProjectHierarchyTreeOrderNumberBadge.vue'

const orderNumberBadgeI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      projectUI: {
        projectHierarchyTree: {
          orderNumberBadgeTooltip: 'Order priority of the document'
        }
      }
    }
  }
})

test('Test that ProjectHierarchyTreeOrderNumberBadge renders label on solid badge', () => {
  const wrapper = mount(ProjectHierarchyTreeOrderNumberBadge, {
    global: {
      plugins: [orderNumberBadgeI18n],
      stubs: {
        QTooltip: {
          template: '<div data-test-locator="order-number-badge-tooltip"><slot /></div>'
        }
      }
    },
    props: {
      label: '12'
    }
  })

  const badge = wrapper.find('[data-test-locator="projectHierarchyTree-orderNumberBadge"]')
  expect(badge.exists()).toBe(true)
  expect(badge.text()).toContain('12')
  expect(badge.classes()).toContain('projectHierarchyTreeOrderNumberBadge')
  expect(wrapper.find('[data-test-locator="order-number-badge-tooltip"]').text())
    .toBe('Order priority of the document')
})
