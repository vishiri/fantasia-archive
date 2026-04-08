import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FoundationColorPalette from '../FoundationColorPalette.vue'

const meta = {
  component: FoundationColorPalette,
  parameters: {
    docs: {
      description: {
        component:
          'Design reference: Fantasia QUASAR COLORS - GENERAL tokens from quasar.variables.scss, plus the default Quasar material palette class stems (bg-* / text-*). Not used in the shipped app UI.'
      },
      story: {
        inline: false
      }
    },
    layout: 'fullscreen'
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Foundation/Color palette'
} satisfies Meta<typeof FoundationColorPalette>

export default meta

export const Default: StoryObj<typeof meta> = {}
