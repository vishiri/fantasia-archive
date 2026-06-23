import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogMarkdownDocumentContent from '../DialogMarkdownDocumentContent.vue'

const meta = {
  component: DialogMarkdownDocumentContent,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogMarkdownDocumentContent'
} satisfies Meta<typeof DialogMarkdownDocumentContent>

export default meta

export const ChangeLog: StoryObj<typeof meta> = {
  args: {
    documentName: 'changeLog'
  }
}

export const License: StoryObj<typeof meta> = {
  args: {
    documentName: 'license'
  }
}
