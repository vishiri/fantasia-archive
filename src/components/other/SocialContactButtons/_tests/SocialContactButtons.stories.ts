import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SocialContactButtons from '../SocialContactButtons.vue'

const meta = {
  title: 'Components/other/SocialContactButtons',
  component: SocialContactButtons,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Grouped social contact CTA rows. Contract: renders seven `SocialContactSingleButton` children with stable ordering from local `_data/buttons`.'
      }
    }
  }
} satisfies Meta<typeof SocialContactButtons>

export default meta

export const Default: StoryObj<typeof meta> = {}
