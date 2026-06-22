import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaLocaleTranslationsInput from '../FaLocaleTranslationsInput.vue'

const meta = {
  component: FaLocaleTranslationsInput,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/elements/FaLocaleTranslationsInput'
} satisfies Meta<typeof FaLocaleTranslationsInput>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    modelValue: {
      'en-US': 'Character',
      de: 'Charakter'
    },
    testLocator: 'storybook-faLocaleTranslationsInput'
  }
}

export const Empty: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'en-US',
    modelValue: {},
    testLocator: 'storybook-faLocaleTranslationsInput-empty'
  }
}

export const PreferredLanguageGerman: StoryObj<typeof meta> = {
  args: {
    currentLanguageCode: 'de',
    modelValue: {
      de: 'Charakter',
      'en-US': 'Character'
    },
    testLocator: 'storybook-faLocaleTranslationsInput-de'
  }
}

export const Multiline: StoryObj<typeof meta> = {
  args: {
    autogrow: true,
    currentLanguageCode: 'en-US',
    inputMode: 'multiline',
    modelValue: {
      'en-US': 'Long description for this field.'
    },
    rows: 4,
    testLocator: 'storybook-faLocaleTranslationsInput-multiline'
  }
}
