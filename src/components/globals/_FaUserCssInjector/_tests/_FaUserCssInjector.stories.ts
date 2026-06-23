import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaUserCssInjector from '../_FaUserCssInjector.vue'

const meta = {
  component: FaUserCssInjector,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/globals/_FaUserCssInjector'
} satisfies Meta<typeof FaUserCssInjector>

export default meta

export const Default: StoryObj<typeof meta> = {}
