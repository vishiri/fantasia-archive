import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectAppControlBarDeleteDocumentButton from '../ProjectAppControlBarDeleteDocumentButton.vue'

const meta = {
  component: ProjectAppControlBarDeleteDocumentButton,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarDeleteDocumentButton'
} satisfies Meta<typeof ProjectAppControlBarDeleteDocumentButton>

export default meta

export const WithLeadingSeparator: StoryObj<typeof meta> = {
  args: {
    showLeadingSeparator: true,
    tooltipLabel: 'Delete document'
  }
}

export const WithoutLeadingSeparator: StoryObj<typeof meta> = {
  args: {
    showLeadingSeparator: false,
    tooltipLabel: 'Delete document'
  }
}
