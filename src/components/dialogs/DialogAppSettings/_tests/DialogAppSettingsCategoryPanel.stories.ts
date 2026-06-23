import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { applyAppSettingsStorybookDisplayTitlesPatch } from './appSettingsStorybookLocalePatch'
import { dialogAppSettingsStorybookCategoryFixture } from './dialogAppSettingsStorybookFixtures'
import DialogAppSettingsCategoryPanel from '../DialogAppSettingsCategoryPanel.vue'

const meta = {
  component: DialogAppSettingsCategoryPanel,
  decorators: [
    (story) => {
      applyAppSettingsStorybookDisplayTitlesPatch()
      return story()
    }
  ],
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogAppSettingsCategoryPanel'
} satisfies Meta<typeof DialogAppSettingsCategoryPanel>

export default meta

export const TabMode: StoryObj<typeof meta> = {
  args: {
    category: dialogAppSettingsStorybookCategoryFixture,
    categoryKey: 'fixtureCategory',
    displayMode: 'tab'
  }
}
