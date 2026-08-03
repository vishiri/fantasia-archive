import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectAppControlBarTabWorldIndicator from '../ProjectAppControlBarTabWorldIndicator.vue'

const meta = {
  component: ProjectAppControlBarTabWorldIndicator,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarTabWorldIndicator'
} satisfies Meta<typeof ProjectAppControlBarTabWorldIndicator>

export default meta

export const Visible: StoryObj<typeof meta> = {
  args: {
    color: '#4caf50',
    documentId: 'doc-hero',
    visible: true
  }
}

export const Hidden: StoryObj<typeof meta> = {
  args: {
    color: '#4caf50',
    documentId: 'doc-hero',
    visible: false
  }
}
