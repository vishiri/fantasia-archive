import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'

import SocialContactButtons from './SocialContactButtons.vue'

const meta = {
  title: 'Components/SocialContactButtons',
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

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const StatesCompositionContract: Story = {
  name: 'States/CompositionContract',
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-test="socialContactSingleButton"]').length).toBe(7)
    await expect(canvasElement.querySelector('[data-test-button-number="7"]')).toBeTruthy()
  }
}
