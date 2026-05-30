import { beforeEach, expect, test, vi } from 'vitest'

import L_socialContactButtonsEnUs from 'app/i18n/en-US/components/other/SocialContactButtons/L_socialContactButtons'

import { socialContactButtonStaticConfig } from '../../_data/buttons'

const { tMock } = vi.hoisted(() => {
  return {
    tMock: vi.fn((messageKey: string) => messageKey)
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        t: tMock
      }
    }
  }
})

import { getSocialContactButtonListForCurrentLocale } from '../socialContactButtons_manager'

beforeEach(() => {
  tMock.mockReset()
  tMock.mockImplementation((messageKey: string) => messageKey)
})

/**
 * getSocialContactButtonListForCurrentLocale
 * Delegates to buildSocialContactButtonList with i18n.global.t.
 */
test('Test that getSocialContactButtonListForCurrentLocale uses i18n.global.t for labels', () => {
  tMock.mockImplementation((messageKey: string) => {
    if (messageKey === 'socialContactButtons.buttonDiscord.label') {
      return L_socialContactButtonsEnUs.buttonDiscord.label
    }

    return messageKey
  })

  const list = getSocialContactButtonListForCurrentLocale()

  expect(tMock).toHaveBeenCalledWith('socialContactButtons.buttonDiscord.label')
  expect(list.buttonDiscord.label).toBe(L_socialContactButtonsEnUs.buttonDiscord.label)
  expect(list.buttonDiscord.url).toBe(socialContactButtonStaticConfig.buttonDiscord.url)
})
