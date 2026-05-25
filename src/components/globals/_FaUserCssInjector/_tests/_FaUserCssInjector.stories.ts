import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaUserCssInjector from '../_FaUserCssInjector.vue'

const meta = {
  component: FaUserCssInjector,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/globals/_FaUserCssInjector'
} satisfies Meta<typeof FaUserCssInjector>

export default meta

export const Default: StoryObj<typeof meta> = {}
