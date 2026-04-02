import type { Meta, StoryObj } from '@storybook/vue3-vite'

import StoryRouterShell from '../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'

const meta = {
  title: 'Layouts/MainLayout',
  component: StoryRouterShell,
  parameters: {
    docs: { disable: true }
  },
  args: {
    initialPath: '/'
  }
} satisfies Meta<typeof StoryRouterShell>

export default meta

type Story = StoryObj<typeof meta>

/** Home route: `IndexPage` inside the main chrome. */
export const WithIndexPage: Story = {
  args: { initialPath: '/' }
}

/** Main layout with an empty outlet (header + drawer + placeholder body). */
export const WithEmptyOutlet: Story = {
  args: { initialPath: '/main-empty' }
}
