import type { I_socialContactButtonSet } from 'app/types/I_socialContactButtons'
import { i18n } from 'app/i18n/externalFileLoader'

export const buttonList: I_socialContactButtonSet = {
  buttonPatreon: {
    title: i18n.global.t('socialContactButtons.buttonPatreon.title'),
    label: i18n.global.t('socialContactButtons.buttonPatreon.label'),
    url: 'https://www.patreon.com/c/vishiri',
    icon: 'patreon_logo.png',
    width: 26,
    height: 26,
    cssClass: 'patreon'
  },
  buttonKofi: {
    title: i18n.global.t('socialContactButtons.buttonKofi.title'),
    label: i18n.global.t('socialContactButtons.buttonKofi.label'),
    url: 'https://ko-fi.com/vishiri',
    icon: 'kofi_logo.png',
    width: 30,
    height: 26,
    cssClass: 'kofi'
  },
  buttonWebsite: {
    title: i18n.global.t('socialContactButtons.buttonWebsite.title'),
    label: i18n.global.t('socialContactButtons.buttonWebsite.label'),
    url: 'https://fantasiaarchive.com',
    icon: 'fa_logo.png',
    width: 40,
    height: 45,
    cssClass: 'website'
  },
  buttonGitHub: {
    title: i18n.global.t('socialContactButtons.buttonGitHub.title'),
    label: i18n.global.t('socialContactButtons.buttonGitHub.label'),
    url: 'https://github.com/vishiri/fantasia-archive',
    icon: 'gh_logo_dark.png',
    width: 40,
    height: 50,
    cssClass: 'github'
  },
  buttonDiscord: {
    title: i18n.global.t('socialContactButtons.buttonDiscord.title'),
    label: i18n.global.t('socialContactButtons.buttonDiscord.label'),
    url: 'https://discord.gg/JQDBvsN9Te',
    icon: 'discord_logo.png',
    width: 37,
    height: 45,
    cssClass: 'discord'
  },
  buttonReddit: {
    title: i18n.global.t('socialContactButtons.buttonReddit.title'),
    label: i18n.global.t('socialContactButtons.buttonReddit.label'),
    url: 'https://www.reddit.com/r/FantasiaArchive',
    icon: 'reddit_logo.png',
    width: 95,
    height: 45,
    cssClass: 'reddit'
  },
  buttonTwitter: {
    title: i18n.global.t('socialContactButtons.buttonTwitter.title'),
    label: i18n.global.t('socialContactButtons.buttonTwitter.label'),
    url: 'https://x.com/VishiriRilgatan',
    icon: 'twitter_logo.png',
    width: 25,
    height: 45,
    cssClass: 'twitter'
  }
}
