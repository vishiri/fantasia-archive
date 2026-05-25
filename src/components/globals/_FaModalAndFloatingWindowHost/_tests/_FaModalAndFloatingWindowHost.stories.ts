import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaModalAndFloatingWindowHost from '../_FaModalAndFloatingWindowHost.vue'

const meta = {
  component: FaModalAndFloatingWindowHost,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/globals/_FaModalAndFloatingWindowHost'
} satisfies Meta<typeof FaModalAndFloatingWindowHost>

export default meta

export const Default: StoryObj<typeof meta> = {}
