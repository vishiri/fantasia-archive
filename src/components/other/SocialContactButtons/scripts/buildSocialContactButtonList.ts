import type { I_socialContactButtonSet } from 'app/types/I_socialContactButtons'

import { socialContactButtonStaticConfig } from '../_data/buttons'

/**
 * Builds the full social-button feed for the active locale using the supplied translate function.
 */
export function buildSocialContactButtonList (
  translate: (messageKey: string) => string
): I_socialContactButtonSet {
  const buttonPatreon = {
    ...socialContactButtonStaticConfig.buttonPatreon,
    label: translate('socialContactButtons.buttonPatreon.label'),
    title: translate('socialContactButtons.buttonPatreon.title')
  }
  const buttonKofi = {
    ...socialContactButtonStaticConfig.buttonKofi,
    label: translate('socialContactButtons.buttonKofi.label'),
    title: translate('socialContactButtons.buttonKofi.title')
  }
  const buttonWebsite = {
    ...socialContactButtonStaticConfig.buttonWebsite,
    label: translate('socialContactButtons.buttonWebsite.label'),
    title: translate('socialContactButtons.buttonWebsite.title')
  }
  const buttonGitHub = {
    ...socialContactButtonStaticConfig.buttonGitHub,
    label: translate('socialContactButtons.buttonGitHub.label'),
    title: translate('socialContactButtons.buttonGitHub.title')
  }
  const buttonDiscord = {
    ...socialContactButtonStaticConfig.buttonDiscord,
    label: translate('socialContactButtons.buttonDiscord.label'),
    title: translate('socialContactButtons.buttonDiscord.title')
  }
  const buttonReddit = {
    ...socialContactButtonStaticConfig.buttonReddit,
    label: translate('socialContactButtons.buttonReddit.label'),
    title: translate('socialContactButtons.buttonReddit.title')
  }
  const buttonTwitter = {
    ...socialContactButtonStaticConfig.buttonTwitter,
    label: translate('socialContactButtons.buttonTwitter.label'),
    title: translate('socialContactButtons.buttonTwitter.title')
  }

  return {
    buttonPatreon,
    buttonKofi,
    buttonWebsite,
    buttonGitHub,
    buttonDiscord,
    buttonReddit,
    buttonTwitter
  }
}
