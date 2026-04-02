import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FantasiaMascotImage from './FantasiaMascotImage.vue'

const meta = {
  title: 'Components/FantasiaMascotImage',
  component: FantasiaMascotImage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Mascot image renderer that can display a chosen mascot variant or a randomized variant when no key is provided.'
      }
    }
  }
} satisfies Meta<typeof FantasiaMascotImage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    height: '120px'
  }
}

export const Random: Story = {
  args: {
    height: '120px'
  }
}

export const Reading: Story = {
  args: {
    fantasiaImage: 'reading',
    height: '120px'
  }
}
