import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { withStorybookWorkspaceHomePreview } from '../../../.storybook-workspace/.storybook/decorators/withStorybookWorkspaceHomePreview'
import StoryRouterShell from '../../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'

const meta = {
  title: 'Pages/IndexPage',
  component: StoryRouterShell,
  parameters: {
    docs: { disable: true }
  },
  args: {
    initialPath: '/home'
  }
} satisfies Meta<typeof StoryRouterShell>

export default meta

/** Legacy dev home with MainLayout (production route: /home). */
export const WithinMainLayout: StoryObj<typeof meta> = {
  args: { initialPath: '/home' },
  decorators: [withStorybookWorkspaceHomePreview]
}
