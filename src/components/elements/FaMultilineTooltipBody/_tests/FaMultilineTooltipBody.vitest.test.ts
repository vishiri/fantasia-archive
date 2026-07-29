import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FaMultilineTooltipBody from '../FaMultilineTooltipBody.vue'

/**
 * FaMultilineTooltipBody
 * Renders intro and bullet lines when text contains a newline.
 */
test('Test that FaMultilineTooltipBody renders intro and bullet lines for multiline text', () => {
  const wrapper = mount(FaMultilineTooltipBody, {
    props: {
      text: 'Missing translations for current language:\n- Singular form missing'
    }
  })

  expect(wrapper.find('.faMultilineTooltipBody__intro').text()).toBe(
    'Missing translations for current language:'
  )
  expect(wrapper.find('.faMultilineTooltipBody__bullet').text()).toBe(
    '- Singular form missing'
  )
})

/**
 * FaMultilineTooltipBody
 * Single-line text stays plain without intro or bullet wrappers.
 */
test('Test that FaMultilineTooltipBody renders plain text for single-line tooltips', () => {
  const wrapper = mount(FaMultilineTooltipBody, {
    props: {
      text: 'Missing group display name for current language.'
    }
  })

  expect(wrapper.text()).toBe('Missing group display name for current language.')
  expect(wrapper.find('.faMultilineTooltipBody__intro').exists()).toBe(false)
})
