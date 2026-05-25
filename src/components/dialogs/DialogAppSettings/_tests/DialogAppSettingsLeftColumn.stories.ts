import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { applyAppSettingsStorybookDisplayTitlesPatch } from './appSettingsStorybookLocalePatch'
import { dialogAppSettingsStorybookMinimalTree } from './dialogAppSettingsStorybookFixtures'
import DialogAppSettingsLeftColumn from '../DialogAppSettingsLeftColumn.vue'

const meta = {
  component: DialogAppSettingsLeftColumn,
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
  title: 'Components/dialogs/DialogAppSettingsLeftColumn'
} satisfies Meta<typeof DialogAppSettingsLeftColumn>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    hasActiveSearchQuery: false,
    appSettingsTree: dialogAppSettingsStorybookMinimalTree,
    searchSettingsQuery: null,
    selectedCategoryTab: 'demoCategory'
  }
}
