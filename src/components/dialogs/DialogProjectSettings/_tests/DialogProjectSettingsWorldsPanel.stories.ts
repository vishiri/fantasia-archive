import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldsPanel from '../DialogProjectSettingsWorldsPanel.vue'

const meta = {
  component: DialogProjectSettingsWorldsPanel,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldsPanel'
} satisfies Meta<typeof DialogProjectSettingsWorldsPanel>

export default meta

export const Default: StoryObj<typeof meta> = {}
