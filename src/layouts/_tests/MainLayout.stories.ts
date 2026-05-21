import type { Meta, StoryObj } from '@storybook/vue3-vite'

import StoryRouterShell from '../../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'

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

/** Welcome route with SplashPage inside the shared shell (production default). */
export const WelcomeWithSplashPage: StoryObj<typeof meta> = {
  args: { initialPath: '/' }
}

/** Home route: IndexPage inside the main chrome. */
export const WithIndexPage: StoryObj<typeof meta> = {
  args: { initialPath: '/home' }
}

/** Main layout with an empty outlet (header + drawer + placeholder body). */
export const WithEmptyOutlet: StoryObj<typeof meta> = {
  args: { initialPath: '/main-empty' }
}

/** Catch-all error page inside the shared shell (header, no drawer). */
export const WithErrorNotFound: StoryObj<typeof meta> = {
  args: { initialPath: '/error-not-found' }
}
