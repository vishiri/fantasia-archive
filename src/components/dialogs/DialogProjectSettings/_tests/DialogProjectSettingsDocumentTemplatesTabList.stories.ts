import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsDocumentTemplatesTabList from '../DialogProjectSettingsDocumentTemplatesTabList.vue'
import { FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB_LIST_WIDTH_PX } from '../scripts/functions/dialogProjectSettingsDialogInput'

const meta = {
  component: DialogProjectSettingsDocumentTemplatesTabList,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsDocumentTemplatesTabList'
} satisfies Meta<typeof DialogProjectSettingsDocumentTemplatesTabList>

export default meta

export const Empty: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    selectedTemplateId: null,
    tabListWidthPx: FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB_LIST_WIDTH_PX,
    templates: []
  }
}

export const WithTemplates: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    selectedTemplateId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    tabListWidthPx: FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB_LIST_WIDTH_PX,
    templates: [{
      documentCount: 0,
      icon: 'mdi-account',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titlePluralTranslations: { 'en-US': 'Character' },
      titleSingularTranslations: {},
      worldAppendixTranslations: {}
    }, {
      documentCount: 0,
      icon: 'mdi-map-marker',
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      titlePluralTranslations: { 'en-US': 'Location' },
      titleSingularTranslations: {},
      worldAppendixTranslations: { 'en-US': 'map' }
    }]
  }
}
