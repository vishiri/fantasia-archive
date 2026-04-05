import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProgramSettings from '../DialogProgramSettings.vue'

const meta = {
  title: 'Components/DialogProgramSettings',
  component: DialogProgramSettings,
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '760px'
      },
      description: {
        component: 'Program settings and keybinds dialog shell. Persistent until Close; Save is reserved for later wiring.'
      }
    }
  }
} satisfies Meta<typeof DialogProgramSettings>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'ProgramSettings'
  }
}
