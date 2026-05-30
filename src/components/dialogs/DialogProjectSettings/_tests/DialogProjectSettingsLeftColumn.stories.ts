import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB } from '../scripts/functions/dialogProjectSettingsDialogInput'
import DialogProjectSettingsLeftColumn from '../DialogProjectSettingsLeftColumn.vue'

const meta = {
  component: DialogProjectSettingsLeftColumn,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsLeftColumn'
} satisfies Meta<typeof DialogProjectSettingsLeftColumn>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
  }
}
