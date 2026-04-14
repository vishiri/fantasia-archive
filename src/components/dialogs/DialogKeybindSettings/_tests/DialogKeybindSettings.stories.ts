import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogKeybindSettings from '../DialogKeybindSettings.vue'

const meta = {
  title: 'Components/dialogs/DialogKeybindSettings',
  component: DialogKeybindSettings,
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '720px'
      },
      description: {
        component:
          'Keybind settings table with capture popup. Storybook uses the shared content bridge stub for faKeybinds and en-US dialog strings from the locale mock.'
      }
    }
  }
} satisfies Meta<typeof DialogKeybindSettings>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'KeybindSettings'
  }
}
