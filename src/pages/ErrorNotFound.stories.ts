import type { Meta, StoryObj } from '@storybook/vue3-vite'

import StoryRouterShell from '../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'

const meta = {
  title: 'Pages/ErrorNotFound',
  component: StoryRouterShell,
  parameters: {
    docs: { disable: true }
  },
  args: {
    initialPath: '/error-not-found'
  }
} satisfies Meta<typeof StoryRouterShell>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { initialPath: '/error-not-found' }
}
