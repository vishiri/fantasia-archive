import { expect, test } from 'vitest'

import L_socialContactButtonsDe from 'app/i18n/de/components/other/SocialContactButtons/L_socialContactButtons'
import L_socialContactButtonsEnUs from 'app/i18n/en-US/components/other/SocialContactButtons/L_socialContactButtons'

import { socialContactButtonStaticConfig } from '../../../_data/buttons'

import { buildSocialContactButtonList } from '../buildSocialContactButtonList'

/**
 * buildSocialContactButtonList
 * Merges static button config with translated label and title strings.
 */
test('Test that buildSocialContactButtonList maps static config and translate output', () => {
  const list = buildSocialContactButtonList((messageKey) => {
    if (messageKey === 'socialContactButtons.buttonPatreon.label') {
      return L_socialContactButtonsEnUs.buttonPatreon.label
    }
    if (messageKey === 'socialContactButtons.buttonPatreon.title') {
      return L_socialContactButtonsEnUs.buttonPatreon.title
    }
    return messageKey
  }, socialContactButtonStaticConfig)

  expect(list.buttonPatreon.label).toBe(L_socialContactButtonsEnUs.buttonPatreon.label)
  expect(list.buttonPatreon.url).toBe('https://www.patreon.com/c/vishiri')
  expect(list.buttonPatreon.cssClass).toBe('patreon')
})

test('Test that buildSocialContactButtonList uses the translate callback for every button key', () => {
  const list = buildSocialContactButtonList((messageKey) => {
    return `translated:${messageKey}`
  }, socialContactButtonStaticConfig)

  expect(list.buttonTwitter.label).toBe('translated:socialContactButtons.buttonTwitter.label')
  expect(list.buttonReddit.title).toBe('translated:socialContactButtons.buttonReddit.title')
})

test('Test that buildSocialContactButtonList can produce German Patreon copy', () => {
  const list = buildSocialContactButtonList((messageKey) => {
    if (messageKey === 'socialContactButtons.buttonPatreon.label') {
      return L_socialContactButtonsDe.buttonPatreon.label
    }
    return 'unused'
  }, socialContactButtonStaticConfig)

  expect(list.buttonPatreon.label).toBe(L_socialContactButtonsDe.buttonPatreon.label)
})
