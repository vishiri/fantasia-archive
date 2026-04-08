import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import AppControlMenus from '../AppControlMenus.vue'

const meta = {
  title: 'Components/globals/AppControlMenus',
  component: AppControlMenus,
  tags: ['autodocs'],
  args: {
    embedDialogs: false
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '320px'
      },
      description: {
        component: 'Top menu composition container. Contract: renders `AppControlSingleMenu` children from internal menu data.'
      }
    }
  }
} satisfies Meta<typeof AppControlMenus>

export default meta

export const Default: StoryObj<typeof meta> = {}

export const CompositionProductionMenuContract: StoryObj<typeof meta> = {
  name: 'States/CompositionProductionMenuContract',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('button').length).toBeGreaterThan(0)
    await expect(canvasElement.querySelectorAll('[data-test-menu-any="appControlMenus-anyMenu"]').length).toBe(4)
  }
}
