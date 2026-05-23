import type { I_socialContactButtonSet } from 'app/types/I_socialContactButtons'

/**
 * Static social-button fields (URLs, icons, layout). Labels and titles come from i18n at render time.
 */
export type I_socialContactButtonStaticConfig = Omit<
  I_socialContactButtonSet[keyof I_socialContactButtonSet],
  'label' | 'title'
>

export const socialContactButtonStaticConfig: {
  [K in keyof I_socialContactButtonSet]: I_socialContactButtonStaticConfig
} = {
  buttonPatreon: {
    url: 'https://www.patreon.com/c/vishiri',
    icon: 'patreon_logo.png',
    width: 26,
    height: 26,
    cssClass: 'patreon'
  },
  buttonKofi: {
    url: 'https://ko-fi.com/vishiri',
    icon: 'kofi_logo.png',
    width: 30,
    height: 26,
    cssClass: 'kofi'
  },
  buttonWebsite: {
    url: 'https://fantasiaarchive.com',
    icon: 'fa_logo.png',
    width: 40,
    height: 45,
    cssClass: 'website'
  },
  buttonGitHub: {
    url: 'https://github.com/vishiri/fantasia-archive',
    icon: 'gh_logo_dark.png',
    width: 40,
    height: 50,
    cssClass: 'github'
  },
  buttonDiscord: {
    url: 'https://discord.gg/JQDBvsN9Te',
    icon: 'discord_logo.png',
    width: 37,
    height: 45,
    cssClass: 'discord'
  },
  buttonReddit: {
    url: 'https://www.reddit.com/r/FantasiaArchive',
    icon: 'reddit_logo.png',
    width: 95,
    height: 45,
    cssClass: 'reddit'
  },
  buttonTwitter: {
    url: 'https://x.com/VishiriRilgatan',
    icon: 'twitter_logo.png',
    width: 25,
    height: 45,
    cssClass: 'twitter'
  }
}
