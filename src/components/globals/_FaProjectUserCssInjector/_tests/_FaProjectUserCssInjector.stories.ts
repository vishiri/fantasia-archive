import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaProjectUserCssInjector from '../_FaProjectUserCssInjector.vue'

const meta = {
  component: FaProjectUserCssInjector,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/globals/_FaProjectUserCssInjector'
} satisfies Meta<typeof FaProjectUserCssInjector>

export default meta

export const Default: StoryObj<typeof meta> = {}
