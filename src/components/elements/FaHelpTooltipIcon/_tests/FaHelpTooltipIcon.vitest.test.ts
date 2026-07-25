/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FaHelpTooltipIcon from '../FaHelpTooltipIcon.vue'

/**
 * FaHelpTooltipIcon
 * Renders diamond frame, FA question glyph, and default slot for tooltip or menu chrome.
 */
test('Test that FaHelpTooltipIcon renders diamond frame, fa-question glyph, and slot content', () => {
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
  expect(wrapper.find('.faHelpTooltipIcon__diamond').exists()).toBe(true)
  expect(wrapper.get('.q-icon').attributes('data-name')).toBe('fa-solid fa-question')
  expect(wrapper.get('[data-test-locator="faHelpTooltipIcon-slot"]').text()).toBe('tooltip body')
})
