import type { Meta, StoryObj } from '@storybook/vue3'

import DialogMarkdownDocument from './DialogMarkdownDocument.vue'

const meta = {
  title: 'Components/DialogMarkdownDocument',
  component: DialogMarkdownDocument
} satisfies Meta<typeof DialogMarkdownDocument>

export default meta

type Story = StoryObj<typeof meta>

export const ChangeLog: Story = {
  args: {
    directInput: 'changeLog'
  }
}
