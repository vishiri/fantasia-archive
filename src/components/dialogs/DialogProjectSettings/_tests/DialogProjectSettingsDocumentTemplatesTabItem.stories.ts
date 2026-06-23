import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsDocumentTemplatesTabItem from '../DialogProjectSettingsDocumentTemplatesTabItem.vue'

const meta = {
  component: DialogProjectSettingsDocumentTemplatesTabItem,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsDocumentTemplatesTabItem'
} satisfies Meta<typeof DialogProjectSettingsDocumentTemplatesTabItem>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    isSelected: false,
    tabHasError: false,
    template: {
      documentCount: 0,
      icon: 'mdi-account',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titlePluralTranslations: { 'en-US': 'Character' },
      titleSingularTranslations: {},
      worldAppendixTranslations: {}
    }
  }
}

export const Selected: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    isSelected: true,
    tabHasError: false,
    template: {
      documentCount: 0,
      icon: 'mdi-account',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titlePluralTranslations: { 'en-US': 'Character' },
      titleSingularTranslations: {},
      worldAppendixTranslations: { 'en-US': 'sheet' }
    }
  }
}

export const ValidationError: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    isSelected: false,
    tabHasError: true,
    template: {
      documentCount: 0,
      icon: '',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titlePluralTranslations: {},
      titleSingularTranslations: {},
      worldAppendixTranslations: {}
    }
  }
}
