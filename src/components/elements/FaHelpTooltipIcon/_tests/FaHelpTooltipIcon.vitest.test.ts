/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FaHelpTooltipIcon from '../FaHelpTooltipIcon.vue'

/**
 * FaHelpTooltipIcon
 * Renders flat circle + fantasy diamond chrome and default slot for tooltip content.
 */
test('Test that FaHelpTooltipIcon renders circle and diamond glyphs and slot content', () => {
  const wrapper = mount(FaHelpTooltipIcon, {
    attrs: {
      'aria-label': 'Help about world color',
      'data-test-locator': 'faHelpTooltipIcon-sample',
      'data-test-tooltip-text': 'World color help'
    },
    slots: {
      default: '<span data-test-locator="faHelpTooltipIcon-slot">tooltip body</span>'
    },
    global: {
      stubs: {
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon" :data-name="name" />'
        }
      }
    }
  })

  const root = wrapper.get('[data-test-locator="faHelpTooltipIcon-sample"]')
  expect(root.attributes('aria-label')).toBe('Help about world color')
  expect(root.attributes('data-test-tooltip-text')).toBe('World color help')
  expect(root.attributes('role')).toBe('img')
  expect(wrapper.find('.faHelpTooltipIcon__circle').exists()).toBe(true)
  expect(wrapper.find('.faHelpTooltipIcon__diamond').exists()).toBe(true)
  expect(wrapper.get('.faHelpTooltipIcon__circle').attributes('data-name')).toBe('mdi-help-circle')
  expect(wrapper.get('.faHelpTooltipIcon__glyph').attributes('data-name')).toBe('fa-solid fa-question')
  expect(wrapper.get('[data-test-locator="faHelpTooltipIcon-slot"]').text()).toBe('tooltip body')
})
