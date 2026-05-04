import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SplashControls from '../SplashControls.vue'

const meta = {
  title: 'Components/other/SplashControls',
  component: SplashControls,
  parameters: {
    docs: { disable: true }
  }
} satisfies Meta<typeof SplashControls>

export default meta

export const Default: StoryObj<typeof meta> = {}
