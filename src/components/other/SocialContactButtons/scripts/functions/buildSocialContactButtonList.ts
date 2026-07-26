import type {
  I_socialContactButton,
  I_socialContactButtonSet
} from 'app/types/I_socialContactButtons'

type T_socialContactButtonStaticFields = Omit<I_socialContactButton, 'label'>

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
    label: translate('socialContactButtons.buttonPatreon.label')
  }
  const buttonKofi = {
    ...staticConfig.buttonKofi,
    label: translate('socialContactButtons.buttonKofi.label')
  }
  const buttonWebsite = {
    ...staticConfig.buttonWebsite,
    label: translate('socialContactButtons.buttonWebsite.label')
  }
  const buttonGitHub = {
    ...staticConfig.buttonGitHub,
    label: translate('socialContactButtons.buttonGitHub.label')
  }
  const buttonDiscord = {
    ...staticConfig.buttonDiscord,
    label: translate('socialContactButtons.buttonDiscord.label')
  }
  const buttonReddit = {
    ...staticConfig.buttonReddit,
    label: translate('socialContactButtons.buttonReddit.label')
  }
  const buttonTwitter = {
    ...staticConfig.buttonTwitter,
    label: translate('socialContactButtons.buttonTwitter.label')
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
