import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

import { setContentBridgeScenario } from '../../../../../.storybook-workspace/.storybook/mocks/contentBridge'

import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

import GlobalLanguageSelector from '../GlobalLanguageSelector.vue'

/**
 * GlobalLanguageSelector is position fixed at the top-right (title-bar chrome). The stage adds
 * minimum size and padding so the trigger stays in view; the bridge mock is applied here so the
 * component always sees faUserSettings before mount (matches preview, defensive for decorator order).
 *
 * Storybook VRT ('yarn test:storybook:visual*') intentionally skips this story via the 'skip-visual'
 * tag: the static iframe capture does not reliably show the fixed trigger even though the same
 * story renders correctly in interactive 'yarn storybook:run' for manual review.
 */
const stageDecorator: Decorator = (story, context) => {
  setContentBridgeScenario(
    context.parameters.contentBridgeScenario ?? 'default',
    context.parameters.contentBridgeOverrides ?? {}
  )

  return {
    components: { story },
    template: `
      <div
        class="fa-storybook-globalLanguageSelector-stage"
        data-test-locator="globalLanguageSelector-storybook-stage"
        style="box-sizing: border-box; min-height: 160px; min-width: 100%; padding: 8px 200px 48px 8px;"
      >
        <p
          style="margin: 0 0 12px; color: var(--fa-color-text-muted); font-size: 12px; line-height: 1.4; max-width: 42rem;"
        >
          Fixed to the top-right like the in-app title bar; widen the viewport if the round flag
          trigger is clipped.
        </p>
        <story />
      </div>
    `
  }
}

const meta = {
  title: 'Components/globals/GlobalLanguageSelector',
  component: GlobalLanguageSelector,
  tags: [
    'autodocs',
    'skip-visual'
  ],
  decorators: [stageDecorator],
  parameters: {
    docs: {
      description: {
        component: `
Electron title-bar language control: loads and saves the interface language through the
faUserSettings preload bridge and applies i18n like production. Storybook enables Electron mode and
the mock bridge in preview and in this story stage so the selector mounts reliably.
`.trim()
      }
    }
  }
} satisfies Meta<typeof GlobalLanguageSelector>

export default meta

export const Default: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const store = S_FaUserSettings()
    await store.refreshSettings()
    const canvas = within(canvasElement)
    await waitFor(() => {
      expect(
        canvas.getByRole('button', {
          name: 'Change interface language'
        })
      ).toBeTruthy()
    })
  }
}
