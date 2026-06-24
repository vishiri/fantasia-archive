import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning from '../DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning.vue'

const meta = {
  component: DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning'
} satisfies Meta<typeof DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    testLocator: 'storybook-treeNode-missingTranslations',
    tooltipText: 'Missing translations for current language:\n- Singular form missing'
  }
}
