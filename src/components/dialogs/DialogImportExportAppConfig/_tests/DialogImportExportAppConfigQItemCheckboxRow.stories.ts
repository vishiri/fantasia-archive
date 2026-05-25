import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogImportExportAppConfigQItemCheckboxRow from '../DialogImportExportAppConfigQItemCheckboxRow.vue'

const meta = {
  component: DialogImportExportAppConfigQItemCheckboxRow,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogImportExportAppConfigQItemCheckboxRow'
} satisfies Meta<typeof DialogImportExportAppConfigQItemCheckboxRow>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    modelValue: true,
    checkboxColor: 'dark',
    dataTestLocator: 'dialogImportExportAppConfig-check-export-settings',
    labelI18nKey: 'dialogs.importExportAppConfig.checkboxes.appSettings'
  }
}
