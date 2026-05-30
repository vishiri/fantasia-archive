import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB } from '../scripts/functions/dialogProjectSettingsDialogInput'
import DialogProjectSettingsPanelsColumn from '../DialogProjectSettingsPanelsColumn.vue'

const meta = {
  component: DialogProjectSettingsPanelsColumn,
  parameters: {
    docs: {
      disable: true,
      story: {
        iframeHeight: '420px'
      }
    },
    layout: 'padded'
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsPanelsColumn'
} satisfies Meta<typeof DialogProjectSettingsPanelsColumn>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    projectName: 'Storybook Sample Project',
    selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
  }
}
