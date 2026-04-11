import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

import GlobalWindowButtons from '../GlobalWindowButtons.vue'

/**
 * 'GlobalWindowButtons' is 'position: fixed', so it does not expand the story root.
 * Give the canvas a minimum height and bottom padding so Docs/Canvas previews are not visually cramped.
 */
const stageDecorator: Decorator = (story) => {
  return {
    components: { story },
    template: `
      <div
        class="fa-storybook-globalWindowButtons-stage-wrap"
        style="box-sizing: border-box; padding-right: 128px;"
      >
        <div
          class="fa-storybook-globalWindowButtons-stage"
          data-test-locator="globalWindowButtons-storybook-stage"
          style="box-sizing: border-box; min-height: 140px; padding-bottom: 56px;"
        >
          <story />
        </div>
      </div>
    `
  }
}

const meta = {
  title: 'Components/globals/GlobalWindowButtons',
  component: GlobalWindowButtons,
  tags: ['autodocs'],
  decorators: [stageDecorator],
  parameters: {
    docs: {
      description: {
        component: `
Window control cluster that reads window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized() (with process.env.MODE === 'electron' in Storybook) to swap the middle control between maximize and restore icons and labels.

Maximized vs default can be validated visually and with interactions in isolation.
`.trim()
      }
    }
  }
} satisfies Meta<typeof GlobalWindowButtons>

export default meta

export const Default: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Maximize' })).toHaveAttribute('aria-label', 'Maximize')
    })
  }
}

export const StatesWindowMaximized: StoryObj<typeof meta> = {
  name: 'States/WindowMaximized',
  parameters: {
    contentBridgeScenario: 'windowMaximized'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Restore' })).toHaveAttribute('aria-label', 'Restore')
    })
  }
}
