import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsDocumentTemplatesDeleteButton from '../DialogProjectSettingsDocumentTemplatesDeleteButton.vue'

const meta = {
  component: DialogProjectSettingsDocumentTemplatesDeleteButton,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsDocumentTemplatesDeleteButton'
} satisfies Meta<typeof DialogProjectSettingsDocumentTemplatesDeleteButton>

export default meta

export const Enabled: StoryObj<typeof meta> = {
  args: {
    removeDisabled: false
  }
}

export const Disabled: StoryObj<typeof meta> = {
  args: {
    removeDisabled: true
  }
}
