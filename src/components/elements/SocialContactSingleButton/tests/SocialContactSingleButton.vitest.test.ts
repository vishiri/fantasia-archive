import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import type { I_socialContactButton } from 'app/types/I_socialContactButtons'

import SocialContactSingleButton from '../SocialContactSingleButton.vue'

const sampleInput: I_socialContactButton = {
  title: 'Unit title',
  label: 'Unit label',
  url: 'https://example.com',
  icon: 'unit.png',
  width: 12,
  height: 14,
  cssClass: 'website'
}

/**
 * SocialContactSingleButton
 * Production path should surface prop payload on the root link and label text.
 */
test('Test that SocialContactSingleButton renders dataInput for default env wiring', () => {
  const w = mount(SocialContactSingleButton, {
    props: { dataInput: sampleInput },
    global: { mocks: { $t: (k: string) => k } }
  })

  expect(w.attributes('title')).toBe(sampleInput.title)
  expect(w.get('[data-test-locator="socialContactSingleButton-text"]').text()).toBe(sampleInput.label)
  w.unmount()
})
