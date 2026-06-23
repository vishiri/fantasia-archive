import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsDocumentTemplatesDetailPanel from '../DialogProjectSettingsDocumentTemplatesDetailPanel.vue'

const meta = {
  component: DialogProjectSettingsDocumentTemplatesDetailPanel,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsDocumentTemplatesDetailPanel'
} satisfies Meta<typeof DialogProjectSettingsDocumentTemplatesDetailPanel>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    nameHasError: false,
    removeDisabled: false,
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

export const NameValidationError: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    nameHasError: true,
    removeDisabled: false,
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
