import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { expect, test } from 'vitest'

import { i18n } from 'app/i18n/externalFileLoader'
import L_socialContactButtonsDe from 'app/i18n/de/components/other/SocialContactButtons/L_socialContactButtons'
import L_socialContactButtonsEnUs from 'app/i18n/en-US/components/other/SocialContactButtons/L_socialContactButtons'

import SocialContactButtons from '../SocialContactButtons.vue'

/**
 * SocialContactButtons
 * Wrapper should expose the number of rendered single-button children via data attribute.
 */
test('Test that SocialContactButtons reports child button count on root dataset', () => {
  const w = mount(SocialContactButtons)

  const root = w.get('[data-test-locator="socialContactButtons"]')
  expect(root.attributes('data-test-button-number')).toBe('7')
  w.unmount()
})

/**
 * SocialContactButtons
 * Patreon label should follow the active interface locale when it changes.
 */
test('Test that SocialContactButtons Patreon label updates when locale changes', async () => {
  i18n.global.t = ((messageKey: string) => {
    if (messageKey === 'socialContactButtons.buttonPatreon.label') {
      return i18n.global.locale.value === 'de'
        ? L_socialContactButtonsDe.buttonPatreon.label
        : L_socialContactButtonsEnUs.buttonPatreon.label
    }
    return messageKey
  }) as typeof i18n.global.t

  i18n.global.locale.value = 'en-US'
  await nextTick()

  const w = mount(SocialContactButtons)
  const patreonLabel = () => w.find('[data-test-locator="socialContactSingleButton-text"]').text()

  expect(patreonLabel()).toBe(L_socialContactButtonsEnUs.buttonPatreon.label)

  i18n.global.locale.value = 'de'
  await nextTick()

  expect(patreonLabel()).toBe(L_socialContactButtonsDe.buttonPatreon.label)
  w.unmount()
})
