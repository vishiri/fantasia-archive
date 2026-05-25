import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogKeybindSettingsCaptureField from '../DialogKeybindSettingsCaptureField.vue'

const meta = {
  component: DialogKeybindSettingsCaptureField,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogKeybindSettingsCaptureField'
} satisfies Meta<typeof DialogKeybindSettingsCaptureField>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    captureError: false,
    captureErrorMessage: '',
    captureInfoMessage: '',
    captureLabel: 'Ctrl + ,',
    statusRegionId: 'storybook-capture-status'
  }
}
