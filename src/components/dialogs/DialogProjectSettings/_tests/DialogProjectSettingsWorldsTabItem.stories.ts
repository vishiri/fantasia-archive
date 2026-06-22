import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldsTabItem from '../DialogProjectSettingsWorldsTabItem.vue'

const meta = {
  component: DialogProjectSettingsWorldsTabItem,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldsTabItem'
} satisfies Meta<typeof DialogProjectSettingsWorldsTabItem>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    isSelected: false,
    tabHasError: false,
    world: {
      color: '',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Falala' },
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  }
}

export const Selected: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    isSelected: true,
    tabHasError: false,
    world: {
      color: '',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Falala' },
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  }
}

export const MissingActiveLocaleTranslation: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'de',
    isSelected: false,
    tabHasError: false,
    world: {
      color: '#9c27b0',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Falala' },
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  }
}
