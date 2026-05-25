import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogImportExportAppConfigImportStep from '../DialogImportExportAppConfigImportStep.vue'

const meta = {
  component: DialogImportExportAppConfigImportStep,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogImportExportAppConfigImportStep'
} satisfies Meta<typeof DialogImportExportAppConfigImportStep>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    importApplyDisabled: false,
    importApplyAppSettings: true,
    importApplyKeybinds: true,
    importApplyAppStyling: true,
    importApplyAppNoteboard: true,
    keybindsImportEnabled: true,
    appNoteboardImportEnabled: true,
    appSettingsImportEnabled: true,
    appStylingImportEnabled: true
  }
}
