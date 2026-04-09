import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FoundationTextList from '../FoundationTextList.vue'

const meta = {
  component: FoundationTextList,
  globals: {
    /**
     * Project preview defaults to a fixed desktop width; override with Storybook's responsive
     * preset (see FANTASIA_STORYBOOK_RESPONSIVE_VIEWPORT_KEY in viewportBreakpoints.ts).
     * Globals lock the viewport so the toolbar cannot snap this story back to 1920px.
     */
    viewport: {
      isRotated: false,
      value: 'responsive'
    }
  },
  parameters: {
    docs: {
      disable: true
    },
    layout: 'fullscreen'
  },
  tags: ['skip-visual'],
  title: 'Components/foundation/FoundationTextList'
} satisfies Meta<typeof FoundationTextList>

export default meta

export const Default: StoryObj<typeof meta> = {}
