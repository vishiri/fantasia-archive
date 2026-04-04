import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

import GlobalWindowButtons from './GlobalWindowButtons.vue'

/**
 * 'GlobalWindowButtons' is 'position: fixed', so it does not expand the story root.
 * Give the canvas a minimum height and bottom padding so Docs/Canvas previews are not visually cramped.
 * For the devtools bridge scenario, show an honest note — this component does not read devtools state.
 */
const stageDecorator: Decorator = (story, context) => {
  const showDevtoolsDisclaimer = context.parameters.contentBridgeScenario === 'devToolsOpen'

  return {
    components: { story },
    setup () {
      return { showDevtoolsDisclaimer }
    },
    template: `
      <div
        class="fa-storybook-globalWindowButtons-stage-wrap"
        style="box-sizing: border-box; padding-right: 128px;"
      >
        <p
          v-if="showDevtoolsDisclaimer"
          class="fa-storybook-globalWindowButtons-stage-note"
          style="margin: 0 0 8px; color: #9e9e9e; font-size: 12px; line-height: 1.4; max-width: 56rem;"
        >
          This component does not render devtools state. The story only sets
          <code style="font-size: 11px;">faDevToolsControl.checkDevToolsStatus()</code>
          in the bridge mock (for other surfaces / integration tests). The buttons look identical to Default.
        </p>
        <div
          class="fa-storybook-globalWindowButtons-stage"
          data-test="globalWindowButtons-storybook-stage"
          style="box-sizing: border-box; min-height: 140px; padding-bottom: 56px;"
        >
          <story />
        </div>
      </div>
    `
  }
}

const meta = {
  title: 'Components/GlobalWindowButtons',
  component: GlobalWindowButtons,
  tags: ['autodocs'],
  decorators: [stageDecorator],
  parameters: {
    docs: {
      description: {
        component: `
Window control cluster that reads window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized() (with process.env.MODE === 'electron' in Storybook) to swap the middle control between maximize and restore icons and labels.

Maximized vs default can be validated visually and with interactions in isolation.

Devtools open is not reflected in this component — nothing in the template calls faDevToolsControl. The devtools mock story exists so the bridge scenario stays available for other stories or Playwright/e2e; use the note in that story’s canvas to avoid confusion.
`.trim()
      }
    }
  }
} satisfies Meta<typeof GlobalWindowButtons>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Maximize' })).toHaveAttribute('aria-label', 'Maximize')
    })
  }
}

export const StatesWindowMaximized: Story = {
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

export const StatesDevToolsOpen: Story = {
  name: 'States/DevToolsOpen',
  parameters: {
    contentBridgeScenario: 'devToolsOpen',
    docs: {
      description: {
        story: 'Bridge mock only: checkDevToolsStatus returns true. This component has no devtools-specific UI—expect the same look as Default.'
      }
    }
  },
  play: async ({ canvasElement }) => {
    expect(window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()).toBe(true)
    const canvas = within(canvasElement)
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Maximize' })).toHaveAttribute('aria-label', 'Maximize')
    })
  }
}
