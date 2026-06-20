import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsDocumentTemplatesEmptyState from '../DialogProjectSettingsDocumentTemplatesEmptyState.vue'

const meta = {
  component: DialogProjectSettingsDocumentTemplatesEmptyState,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsDocumentTemplatesEmptyState'
} satisfies Meta<typeof DialogProjectSettingsDocumentTemplatesEmptyState>

export default meta

export const Default: StoryObj<typeof meta> = {}
