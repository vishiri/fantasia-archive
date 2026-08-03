import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsEntityTabList from '../DialogProjectSettingsEntityTabList.vue'
import { FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB_LIST_WIDTH_PX } from '../scripts/functions/dialogProjectSettingsDialogInput'

const meta = {
  component: DialogProjectSettingsEntityTabList,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsEntityTabList'
} satisfies Meta<typeof DialogProjectSettingsEntityTabList>

export default meta

export const WorldsConfig: StoryObj<typeof meta> = {
  args: {
    addButtonLabelKey: 'dialogs.projectSettings.panels.worlds.addWorldButton',
    blockClassSuffix: 'dialogProjectSettingsWorldsTabList',
    cloneList: (items: Array<{ id: string }>) => items.map((item) => ({ ...item })),
    currentLanguageCode: 'en-US',
    dragIdDataAttribute: 'data-test-world-id',
    emptyFilteredKey: 'dialogs.projectSettings.panels.worlds.emptyFilteredWorlds',
    filterAriaLabelKey: 'dialogs.projectSettings.panels.worlds.filterAriaLabel',
    filterClearAriaLabelKey: 'dialogs.projectSettings.panels.worlds.filterClearAriaLabel',
    filterItems: (list: Array<{ id: string }>) => list,
    filterPlaceholderKey: 'dialogs.projectSettings.panels.worlds.filterPlaceholder',
    items: [
      { id: '550e8400-e29b-41d4-a716-446655440000' },
      { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' }
    ],
    testLocatorAddButton: 'dialogProjectSettings-worlds-addButton',
    testLocatorFilterClear: 'dialogProjectSettings-worldsFilterClear',
    testLocatorFilterEmpty: 'dialogProjectSettings-worldsFilterEmpty',
    testLocatorFilterInput: 'dialogProjectSettings-worldsFilterInput',
    testLocatorList: 'dialogProjectSettings-worlds-list'
  },
  render: (args) => ({
    components: { DialogProjectSettingsEntityTabList },
    setup () {
      return { args }
    },
    template: `
      <DialogProjectSettingsEntityTabList v-bind="args">
        <template #tab="{ item }">
          <span>{{ item.id }}</span>
        </template>
      </DialogProjectSettingsEntityTabList>
    `
  })
}

export const DocumentTemplatesConfig: StoryObj<typeof meta> = {
  args: {
    addButtonLabelKey: 'dialogs.projectSettings.panels.documentTemplates.addTemplateButton',
    blockClassSuffix: 'dialogProjectSettingsDocumentTemplatesTabList',
    cloneList: (items: Array<{ id: string }>) => items.map((item) => ({ ...item })),
    currentLanguageCode: 'en-US',
    dense: true,
    dragIdDataAttribute: 'data-test-template-id',
    emptyFilteredKey: 'dialogs.projectSettings.panels.documentTemplates.emptyFilteredTemplates',
    filterAriaLabelKey: 'dialogs.projectSettings.panels.documentTemplates.filterAriaLabel',
    filterClearAriaLabelKey: 'dialogs.projectSettings.panels.documentTemplates.filterClearAriaLabel',
    filterItems: (list: Array<{ id: string }>) => list,
    filterPlaceholderKey: 'dialogs.projectSettings.panels.documentTemplates.filterPlaceholder',
    items: [
      { id: '7c9e6679-7425-40de-944b-e07fc1f90ae7' },
      { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' }
    ],
    tabListWidthPx: FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB_LIST_WIDTH_PX,
    testLocatorAddButton: 'dialogProjectSettings-documentTemplates-addButton',
    testLocatorFilterClear: 'dialogProjectSettings-documentTemplatesFilterClear',
    testLocatorFilterEmpty: 'dialogProjectSettings-documentTemplatesFilterEmpty',
    testLocatorFilterInput: 'dialogProjectSettings-documentTemplatesFilterInput',
    testLocatorList: 'dialogProjectSettings-documentTemplates-list'
  },
  render: (args) => ({
    components: { DialogProjectSettingsEntityTabList },
    setup () {
      return { args }
    },
    template: `
      <DialogProjectSettingsEntityTabList v-bind="args">
        <template #tab="{ item }">
          <span>{{ item.id }}</span>
        </template>
      </DialogProjectSettingsEntityTabList>
    `
  })
}
