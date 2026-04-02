import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { buttonList } from '../SocialContactButtons/_data/buttons'
import SocialContactSingleButton from './SocialContactSingleButton.vue'

const meta = {
  title: 'Components/SocialContactSingleButton',
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

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Patreon: Story = {
  args: {
    dataInput: buttonList.buttonPatreon
  }
}

export const GitHub: Story = {
  args: {
    dataInput: buttonList.buttonGitHub
  }
}

export const Kofi: Story = {
  args: {
    dataInput: buttonList.buttonKofi
  }
}

export const Website: Story = {
  args: {
    dataInput: buttonList.buttonWebsite
  }
}

export const Discord: Story = {
  args: {
    dataInput: buttonList.buttonDiscord
  }
}

export const Reddit: Story = {
  args: {
    dataInput: buttonList.buttonReddit
  }
}

export const Twitter: Story = {
  args: {
    dataInput: buttonList.buttonTwitter
  }
}
