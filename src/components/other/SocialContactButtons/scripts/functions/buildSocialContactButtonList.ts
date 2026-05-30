import type {
  I_socialContactButton,
  I_socialContactButtonSet
} from 'app/types/I_socialContactButtons'

type T_socialContactButtonStaticFields = Omit<I_socialContactButton, 'label' | 'title'>

/**
 * Builds the full social-button feed for the active locale using the supplied translate function.
 */
export function buildSocialContactButtonList (
  translate: (messageKey: string) => string,
  staticConfig: {
    [K in keyof I_socialContactButtonSet]: T_socialContactButtonStaticFields
  }
): I_socialContactButtonSet {
  const buttonPatreon = {
    ...staticConfig.buttonPatreon,
    label: translate('socialContactButtons.buttonPatreon.label'),
    title: translate('socialContactButtons.buttonPatreon.title')
  }
  const buttonKofi = {
    ...staticConfig.buttonKofi,
    label: translate('socialContactButtons.buttonKofi.label'),
    title: translate('socialContactButtons.buttonKofi.title')
  }
  const buttonWebsite = {
    ...staticConfig.buttonWebsite,
    label: translate('socialContactButtons.buttonWebsite.label'),
    title: translate('socialContactButtons.buttonWebsite.title')
  }
  const buttonGitHub = {
    ...staticConfig.buttonGitHub,
    label: translate('socialContactButtons.buttonGitHub.label'),
    title: translate('socialContactButtons.buttonGitHub.title')
  }
  const buttonDiscord = {
    ...staticConfig.buttonDiscord,
    label: translate('socialContactButtons.buttonDiscord.label'),
    title: translate('socialContactButtons.buttonDiscord.title')
  }
  const buttonReddit = {
    ...staticConfig.buttonReddit,
    label: translate('socialContactButtons.buttonReddit.label'),
    title: translate('socialContactButtons.buttonReddit.title')
  }
  const buttonTwitter = {
    ...staticConfig.buttonTwitter,
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
