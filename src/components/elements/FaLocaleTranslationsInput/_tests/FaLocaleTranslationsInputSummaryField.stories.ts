import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaLocaleTranslationsInputSummaryField from '../FaLocaleTranslationsInputSummaryField.vue'

const meta = {
  component: FaLocaleTranslationsInputSummaryField,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/elements/FaLocaleTranslationsInputSummaryField'
} satisfies Meta<typeof FaLocaleTranslationsInputSummaryField>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    autogrow: false,
    color: 'primary-bright',
    dark: true,
    dense: true,
    error: false,
    fallbackWarningTooltip: 'This field lacks current language translation.',
    hideBottomSpace: true,
    isMenuPresentationLocked: false,
    isMultilineInput: false,
    localeRows: [
      {
        code: 'en-US',
        displayName: 'English'
      }
    ],
    lockedMenuContentStyle: undefined,
    menuOffset: [0, 4],
    menuTarget: undefined,
    onTranslationsMenuBeforeShow: () => {},
    onTranslationsMenuHide: () => {},
    onTranslationsMenuShow: () => {},
    openTranslationsMenu: () => {},
    readLocaleValue: () => 'Character',
    resolvedLanguageCode: 'en-US',
    resolvedTextareaRows: 1,
    resolvedValue: 'Character',
    setPreferredLanguageInputRef: () => {},
    showFallbackWarning: false,
    testLocator: 'storybook-faLocaleTranslationsInput-summaryField',
    translateButtonTooltip: 'Edit translations',
    translationsMenuOpen: false,
    updateLocaleValue: () => {}
  }
}
