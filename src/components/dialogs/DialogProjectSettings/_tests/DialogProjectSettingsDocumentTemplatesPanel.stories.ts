import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsDocumentTemplatesPanel from '../DialogProjectSettingsDocumentTemplatesPanel.vue'

const meta = {
  component: DialogProjectSettingsDocumentTemplatesPanel,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsDocumentTemplatesPanel'
} satisfies Meta<typeof DialogProjectSettingsDocumentTemplatesPanel>

export default meta

export const Empty: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    templates: []
  }
}

export const WithTemplates: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    templates: [{
      documentCount: 0,
      icon: '',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titlePluralTranslations: { 'en-US': 'Character' },
      titleSingularTranslations: {},
      worldAppendixTranslations: {}
    }]
  }
}
