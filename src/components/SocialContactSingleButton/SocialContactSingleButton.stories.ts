import type { Meta, StoryObj } from '@storybook/vue3'

import { buttonList } from '../SocialContactButtons/_data/buttons'
import SocialContactSingleButton from './SocialContactSingleButton.vue'

const meta = {
  title: 'Components/SocialContactSingleButton',
  component: SocialContactSingleButton
} satisfies Meta<typeof SocialContactSingleButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    dataInput: buttonList.buttonWebsite
  }
}

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
