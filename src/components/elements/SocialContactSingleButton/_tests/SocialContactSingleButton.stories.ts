import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { getSocialContactButtonListForCurrentLocale } from '../../../other/SocialContactButtons/scripts/socialContactButtons_manager'
import SocialContactSingleButton from '../SocialContactSingleButton.vue'

const buttonList = getSocialContactButtonListForCurrentLocale()

const meta = {
  title: 'Components/elements/SocialContactSingleButton',
  component: SocialContactSingleButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Single social contact CTA (icon + label + link). Contract: `dataInput` supplies `I_socialContactButton` fields used for URL, label, icon path, and layout classes.'
      }
    }
  },
  args: {
    dataInput: buttonList.buttonWebsite
  }
} satisfies Meta<typeof SocialContactSingleButton>

export default meta

export const Default: StoryObj<typeof meta> = {}

export const Patreon: StoryObj<typeof meta> = {
  args: {
    dataInput: buttonList.buttonPatreon
  }
}

export const GitHub: StoryObj<typeof meta> = {
  args: {
    dataInput: buttonList.buttonGitHub
  }
}

export const Kofi: StoryObj<typeof meta> = {
  args: {
    dataInput: buttonList.buttonKofi
  }
}

export const Website: StoryObj<typeof meta> = {
  args: {
    dataInput: buttonList.buttonWebsite
  }
}

export const Discord: StoryObj<typeof meta> = {
  args: {
    dataInput: buttonList.buttonDiscord
  }
}

export const Reddit: StoryObj<typeof meta> = {
  args: {
    dataInput: buttonList.buttonReddit
  }
}

export const Twitter: StoryObj<typeof meta> = {
  args: {
    dataInput: buttonList.buttonTwitter
  }
}
