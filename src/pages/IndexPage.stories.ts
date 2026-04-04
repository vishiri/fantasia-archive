import type { Meta, StoryObj } from '@storybook/vue3-vite'

import StoryRouterShell from '../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'

const meta = {
  title: 'Pages/IndexPage',
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

/** Same page as production home, inside 'MainLayout'. */
export const WithinMainLayout: Story = {
  args: { initialPath: '/' }
}
