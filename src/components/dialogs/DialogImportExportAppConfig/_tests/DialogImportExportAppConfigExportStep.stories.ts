import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogImportExportAppConfigExportStep from '../DialogImportExportAppConfigExportStep.vue'

const meta = {
  component: DialogImportExportAppConfigExportStep,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogImportExportAppConfigExportStep'
} satisfies Meta<typeof DialogImportExportAppConfigExportStep>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    createExportDisabled: false,
    exportIncludeAppSettings: true,
    exportIncludeKeybinds: true,
    exportIncludeAppStyling: true,
    exportIncludeAppNoteboard: true
  }
}
