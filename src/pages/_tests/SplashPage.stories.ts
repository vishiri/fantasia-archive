import type { Meta, StoryObj } from '@storybook/vue3-vite'

import StoryRouterShell from '../../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'

const meta = {
  title: 'Pages/SplashPage',
  component: StoryRouterShell,
  parameters: {
    docs: { disable: true }
  },
  args: {
    initialPath: '/'
  }
} satisfies Meta<typeof StoryRouterShell>

export default meta

/** Fullscreen welcome layout (production default route). */
export const Default: StoryObj<typeof meta> = {
  args: { initialPath: '/' }
}
