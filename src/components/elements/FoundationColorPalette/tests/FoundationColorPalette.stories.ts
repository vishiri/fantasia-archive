import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FoundationColorPalette from '../FoundationColorPalette.vue'

const meta = {
  component: FoundationColorPalette,
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
  title: 'Foundation/Color palette'
} satisfies Meta<typeof FoundationColorPalette>

export default meta

export const Default: StoryObj<typeof meta> = {}
