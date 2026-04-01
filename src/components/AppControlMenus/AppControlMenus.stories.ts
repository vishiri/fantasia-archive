import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, within } from '@storybook/test'

import AppControlMenus from './AppControlMenus.vue'

const meta = {
  title: 'Components/AppControlMenus',
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

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CompositionProductionMenuContract: Story = {
  name: 'States/CompositionProductionMenuContract',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('button').length).toBeGreaterThan(0)
    await expect(canvasElement.querySelectorAll('[data-test-any-menu="appControlMenus-anyMenu"]').length).toBe(4)
  }
}
