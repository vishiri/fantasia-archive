import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogImportExportAppConfig from '../DialogImportExportAppConfig.vue'

const meta = {
  title: 'Components/dialogs/DialogImportExportAppConfig',
  component: DialogImportExportAppConfig,
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '720px'
      },
      description: {
        component:
          'Import and export app configuration (.faconfig). Storybook uses a stub faAppConfig (prepareImport succeeds; export cancels) plus en-US strings from the locale mock.'
      }
    }
  }
} satisfies Meta<typeof DialogImportExportAppConfig>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'ImportExportAppConfig'
  }
}
