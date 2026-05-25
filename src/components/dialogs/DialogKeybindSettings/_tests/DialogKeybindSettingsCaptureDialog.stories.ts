import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogKeybindSettingsCaptureDialog from '../DialogKeybindSettingsCaptureDialog.vue'

const meta = {
  component: DialogKeybindSettingsCaptureDialog,
  parameters: {
    docs: {
      disable: true,
      story: {
        iframeHeight: '420px',
        inline: false
      }
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogKeybindSettingsCaptureDialog'
} satisfies Meta<typeof DialogKeybindSettingsCaptureDialog>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    actionName: 'Open App Settings',
    captureError: false,
    captureErrorMessage: '',
    captureInfoMessage: '',
    captureLabel: '',
    hasPendingChord: false,
    modelValue: true
  }
}
