import type { Meta, StoryObj } from '@storybook/vue3-vite'

import {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
  FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB
} from '../scripts/functions/dialogProjectSettingsDialogInput'
import DialogProjectSettingsTabBar from '../DialogProjectSettingsTabBar.vue'

const meta = {
  component: DialogProjectSettingsTabBar,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsTabBar'
} satisfies Meta<typeof DialogProjectSettingsTabBar>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    generalTabHasError: false,
    selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
    worldsTabHasError: false
  }
}

export const WorldsTabSelected: StoryObj<typeof meta> = {
  args: {
    generalTabHasError: false,
    selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB,
    worldsTabHasError: false
  }
}
