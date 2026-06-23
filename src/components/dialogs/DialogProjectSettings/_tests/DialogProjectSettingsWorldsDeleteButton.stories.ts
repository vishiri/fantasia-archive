import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldsDeleteButton from '../DialogProjectSettingsWorldsDeleteButton.vue'

const meta = {
  component: DialogProjectSettingsWorldsDeleteButton,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldsDeleteButton'
} satisfies Meta<typeof DialogProjectSettingsWorldsDeleteButton>

export default meta

export const Enabled: StoryObj<typeof meta> = {
  args: {
    removeDisabled: false,
    removeDisabledReason: null
  }
}

export const DisabledHasDocuments: StoryObj<typeof meta> = {
  args: {
    removeDisabled: true,
    removeDisabledReason: 'hasDocuments'
  }
}
