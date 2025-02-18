import { I_socialContactButtons } from 'app/types/I_socialContactButtons'
import { i18n } from 'app/src/i18n/externalFileLoader'

export const buttonList: I_socialContactButtons = {
  buttonPatreon: {
    title: i18n.global.t('SocialContactButtons.buttonPatreon.title'),
    label: i18n.global.t('SocialContactButtons.buttonPatreon.label'),
    url: 'https://www.patreon.com/c/vishiri',
    icon: 'patreon_logo.png',
    width: 26,
    height: 26,
    cssClass: 'patreon'
  },
  buttonKofi: {
    title: i18n.global.t('SocialContactButtons.buttonKofi.title'),
    label: i18n.global.t('SocialContactButtons.buttonKofi.label'),
    url: 'https://ko-fi.com/vishiri',
    icon: 'kofi_logo.png',
    width: 30,
    height: 26,
    cssClass: 'kofi'
  },
  buttonWebsite: {
    title: i18n.global.t('SocialContactButtons.buttonWebsite.title'),
    label: i18n.global.t('SocialContactButtons.buttonWebsite.label'),
    url: 'https://fantasiaarchive.com',
    icon: 'fa_logo.png',
    width: 40,
    height: 45,
    cssClass: 'website'
  },
  buttonGitHub: {
    title: i18n.global.t('SocialContactButtons.buttonGitHub.title'),
    label: i18n.global.t('SocialContactButtons.buttonGitHub.label'),
    url: 'https://github.com/vishiri/fantasia-archive',
    icon: 'gh_logo_dark.png',
    width: 40,
    height: 50,
    cssClass: 'github'
  },
  buttonDiscord: {
    title: i18n.global.t('SocialContactButtons.buttonDiscord.title'),
    label: i18n.global.t('SocialContactButtons.buttonDiscord.label'),
    url: 'https://discord.gg/JQDBvsN9Te',
    icon: 'discord_logo.png',
    width: 37,
    height: 45,
    cssClass: 'discord'
  },
  buttonReddit: {
    title: i18n.global.t('SocialContactButtons.buttonReddit.title'),
    label: i18n.global.t('SocialContactButtons.buttonReddit.label'),
    url: 'https://www.reddit.com/r/FantasiaArchive',
    icon: 'reddit_logo.png',
    width: 95,
    height: 45,
    cssClass: 'reddit'
  },
  buttonTwitter: {
    title: i18n.global.t('SocialContactButtons.buttonTwitter.title'),
    label: i18n.global.t('SocialContactButtons.buttonTwitter.label'),
    url: 'https://x.com/VishiriRilgatan',
    icon: 'twitter_logo.png',
    width: 25,
    height: 45,
    cssClass: 'twitter'
  }
}
