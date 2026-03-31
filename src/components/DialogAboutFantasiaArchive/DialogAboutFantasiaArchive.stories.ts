import type { Meta, StoryObj } from '@storybook/vue3'

import DialogAboutFantasiaArchive from './DialogAboutFantasiaArchive.vue'

const meta = {
  title: 'Components/DialogAboutFantasiaArchive',
  component: DialogAboutFantasiaArchive
} satisfies Meta<typeof DialogAboutFantasiaArchive>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    directInput: 'AboutFantasiaArchive'
  }
}
