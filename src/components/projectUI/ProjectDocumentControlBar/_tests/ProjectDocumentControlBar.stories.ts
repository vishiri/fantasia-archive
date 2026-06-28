import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectDocumentControlBar from '../ProjectDocumentControlBar.vue'

const meta = {
  component: ProjectDocumentControlBar,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectDocumentControlBar'
} satisfies Meta<typeof ProjectDocumentControlBar>

export default meta

export const Default: StoryObj<typeof meta> = {}
