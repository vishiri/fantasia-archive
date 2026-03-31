import type { Meta, StoryObj } from '@storybook/vue3'

import AppControlMenus from './AppControlMenus.vue'

const meta = {
  title: 'Components/AppControlMenus',
  component: AppControlMenus
} satisfies Meta<typeof AppControlMenus>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
