import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { applyAppSettingsStorybookDisplayTitlesPatch } from './appSettingsStorybookLocalePatch'
import { dialogAppSettingsStorybookMinimalTree } from './dialogAppSettingsStorybookFixtures'
import DialogAppSettingsPanelsColumn from '../DialogAppSettingsPanelsColumn.vue'

const meta = {
  component: DialogAppSettingsPanelsColumn,
  decorators: [
    (story) => {
      applyAppSettingsStorybookDisplayTitlesPatch()
      return story()
    }
  ],
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogAppSettingsPanelsColumn'
} satisfies Meta<typeof DialogAppSettingsPanelsColumn>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    hasActiveSearchQuery: false,
    hasSearchNoMatchingSettings: false,
    appSettingsTree: dialogAppSettingsStorybookMinimalTree,
    searchFilteredAppSettingsTree: dialogAppSettingsStorybookMinimalTree,
    selectedCategoryTab: 'demoCategory'
  }
}
