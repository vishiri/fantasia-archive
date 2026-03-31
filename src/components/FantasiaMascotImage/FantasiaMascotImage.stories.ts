import type { Meta, StoryObj } from '@storybook/vue3'

import FantasiaMascotImage from './FantasiaMascotImage.vue'

const meta = {
  title: 'Components/FantasiaMascotImage',
  component: FantasiaMascotImage
} satisfies Meta<typeof FantasiaMascotImage>

export default meta

type Story = StoryObj<typeof meta>

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
