import type { Meta, StoryObj } from '@storybook/vue3'

import SocialContactButtons from './SocialContactButtons.vue'

const meta = {
  title: 'Components/SocialContactButtons',
  component: SocialContactButtons
} satisfies Meta<typeof SocialContactButtons>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
