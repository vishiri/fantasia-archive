import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldAvailableTemplatesList from '../DialogProjectSettingsWorldAvailableTemplatesList.vue'

const meta = {
  component: DialogProjectSettingsWorldAvailableTemplatesList,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldAvailableTemplatesList'
} satisfies Meta<typeof DialogProjectSettingsWorldAvailableTemplatesList>

export default meta

export const WithTemplates: StoryObj<typeof meta> = {
  args: {
    templates: [{
      displayName: 'Character',
      documentCount: 0,
      icon: 'mdi-account',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      worldAppendix: ' sheet'
    }]
  }
}

export const Empty: StoryObj<typeof meta> = {
  args: {
    templates: []
  }
}
