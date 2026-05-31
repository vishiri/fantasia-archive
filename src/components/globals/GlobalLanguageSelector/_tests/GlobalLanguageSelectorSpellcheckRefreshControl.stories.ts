import type { Meta, StoryObj } from '@storybook/vue3-vite'

import GlobalLanguageSelectorSpellcheckRefreshControl from '../GlobalLanguageSelectorSpellcheckRefreshControl.vue'

/**
 * Storybook VRT skips this story via 'skip-visual': the control is title-bar chrome and the static
 * iframe capture does not reliably show it; interactive 'yarn storybook:run' remains the review path.
 */
const meta = {
  component: GlobalLanguageSelectorSpellcheckRefreshControl,
  tags: [
    'autodocs',
    'skip-visual'
  ],
  parameters: {
    docs: {
      description: {
        component: `
Companion control beside the language selector that refreshes spellcheck after a locale change.
Shown only when the parent passes show=true (typically after the user picks a new interface language).
`.trim()
      }
    }
  },
  title: 'Components/globals/GlobalLanguageSelectorSpellcheckRefreshControl'
} satisfies Meta<typeof GlobalLanguageSelectorSpellcheckRefreshControl>

export default meta

export const Visible: StoryObj<typeof meta> = {
  args: {
    show: true
  }
}
