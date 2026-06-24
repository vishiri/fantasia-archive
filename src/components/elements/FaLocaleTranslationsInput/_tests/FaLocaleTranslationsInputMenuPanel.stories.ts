import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaLocaleTranslationsInputMenuPanel from '../FaLocaleTranslationsInputMenuPanel.vue'

const meta = {
  component: FaLocaleTranslationsInputMenuPanel,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/elements/FaLocaleTranslationsInputMenuPanel'
} satisfies Meta<typeof FaLocaleTranslationsInputMenuPanel>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    autogrow: false,
    isMultilineInput: false,
    localeRows: [
      {
        code: 'en-US',
        displayName: 'English'
      },
      {
        code: 'de',
        displayName: 'German'
      }
    ],
    readLocaleValue: () => 'Character',
    rows: 1,
    setPreferredLanguageInputRef: () => {},
    testLocator: 'storybook-faLocaleTranslationsInput-menuPanel',
    updateLocaleValue: () => {}
  }
}
