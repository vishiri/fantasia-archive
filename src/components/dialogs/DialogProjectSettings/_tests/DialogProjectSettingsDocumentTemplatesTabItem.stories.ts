import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsDocumentTemplatesTabItem from '../DialogProjectSettingsDocumentTemplatesTabItem.vue'

const meta = {
  component: DialogProjectSettingsDocumentTemplatesTabItem,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsDocumentTemplatesTabItem'
} satisfies Meta<typeof DialogProjectSettingsDocumentTemplatesTabItem>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    isSelected: false,
    tabHasError: false,
    template: {
      displayName: 'Character',
      documentCount: 0,
      icon: 'mdi-account',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      worldAppendix: ''
    }
  }
}

export const Selected: StoryObj<typeof meta> = {
  args: {
    isSelected: true,
    tabHasError: false,
    template: {
      displayName: 'Character',
      documentCount: 0,
      icon: 'mdi-account',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      worldAppendix: ' sheet'
    }
  }
}

export const ValidationError: StoryObj<typeof meta> = {
  args: {
    isSelected: false,
    tabHasError: true,
    template: {
      displayName: '',
      documentCount: 0,
      icon: '',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      worldAppendix: ''
    }
  }
}
