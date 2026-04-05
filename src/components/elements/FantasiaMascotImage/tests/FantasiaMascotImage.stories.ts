import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FantasiaMascotImage from '../FantasiaMascotImage.vue'

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

export const Default: StoryObj<typeof meta> = {
  args: {
    height: '120px'
  }
}

export const Random: StoryObj<typeof meta> = {
  args: {
    height: '120px'
  }
}

export const Reading: StoryObj<typeof meta> = {
  args: {
    fantasiaImage: 'reading',
    height: '120px'
  }
}
