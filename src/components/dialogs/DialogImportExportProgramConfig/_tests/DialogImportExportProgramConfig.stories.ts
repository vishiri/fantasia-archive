import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogImportExportProgramConfig from '../DialogImportExportProgramConfig.vue'

const meta = {
  title: 'Components/dialogs/DialogImportExportProgramConfig',
  component: DialogImportExportProgramConfig,
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '720px'
      },
      description: {
        component:
          'Import and export program configuration (.faconfig). Storybook uses a stub faProgramConfig (prepareImport succeeds; export cancels) plus en-US strings from the locale mock.'
      }
    }
  }
} satisfies Meta<typeof DialogImportExportProgramConfig>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'ImportExportProgramConfig'
  }
}
