import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldAvailableTemplatesList from '../DialogProjectSettingsWorldAvailableTemplatesList.vue'

const meta = {
  component: DialogProjectSettingsWorldAvailableTemplatesList,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldAvailableTemplatesList'
} satisfies Meta<typeof DialogProjectSettingsWorldAvailableTemplatesList>

export default meta

export const WithTemplates: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    templates: [{
      documentCount: 0,
      icon: 'mdi-account',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titlePluralTranslations: { 'en-US': 'Character' },
      titleSingularTranslations: {},
      worldAppendixTranslations: { 'en-US': 'sheet' }
    }]
  }
}

export const Empty: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    templates: []
  }
}

export const MissingActiveLocaleTranslation: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'de',
    templates: [{
      documentCount: 0,
      icon: 'mdi-account',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titlePluralTranslations: { 'en-US': 'Character' },
      titleSingularTranslations: {},
      worldAppendixTranslations: { 'en-US': 'sheet' }
    }]
  }
}
