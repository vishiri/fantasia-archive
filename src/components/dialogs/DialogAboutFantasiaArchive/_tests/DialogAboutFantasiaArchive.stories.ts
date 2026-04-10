import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogAboutFantasiaArchive from '../DialogAboutFantasiaArchive.vue'

const meta = {
  title: 'Components/dialogs/DialogAboutFantasiaArchive',
  component: DialogAboutFantasiaArchive,
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '760px'
      },
      description: {
        component: 'About dialog wrapper with project version display and social contact button composition.'
      }
    }
  }
} satisfies Meta<typeof DialogAboutFantasiaArchive>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'AboutFantasiaArchive'
  }
}
