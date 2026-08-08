import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import ProjectHierarchyTreeNodeContextMenuTagRows from '../ProjectHierarchyTreeNodeContextMenuTagRows.vue'

const meta = {
  component: ProjectHierarchyTreeNodeContextMenuTagRows,
  parameters: {
    docs: {
      story: {
        inline: false
      }
    }
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeNodeContextMenuTagRows'
} satisfies Meta<typeof ProjectHierarchyTreeNodeContextMenuTagRows>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: {
      ProjectHierarchyTreeNodeContextMenuTagRows
    },
    setup () {
      const isAddToTagSubmenuOpen = ref(false)
      return {
        addDocumentPlacementOptions: [
          {
            icon: 'mdi-account',
            label: 'Character',
            nodeId: 'placement-heroes'
          },
          {
            icon: 'mdi-map-marker',
            label: 'Scene',
            nodeId: 'placement-scenes'
          }
        ],
        addNewDocumentToThisTagLabel: 'Add new document to this tag',
        deleteTagLabel: 'Delete tag',
        isAddToTagSubmenuOpen,
        onAddNewDocumentToThisTagClick: () => {},
        onAddToTagSubmenuActivatorEnter: () => {
          isAddToTagSubmenuOpen.value = true
        },
        onAddToTagSubmenuModelUpdate: (shown: boolean) => {
          isAddToTagSubmenuOpen.value = shown
        },
        onDeleteTagClick: () => {},
        onRenameTagClick: () => {},
        onSubmenuActivatorLeave: () => {},
        onSubmenuContentEnter: () => {},
        onSubmenuContentLeave: () => {},
        renameTagLabel: 'Rename tag'
      }
    },
    template: `
      <q-list dark style="max-width: 320px; background: #1d1d1d;">
        <ProjectHierarchyTreeNodeContextMenuTagRows
          :add-document-placement-options="addDocumentPlacementOptions"
          :add-new-document-to-this-tag-label="addNewDocumentToThisTagLabel"
          :delete-tag-label="deleteTagLabel"
          :is-add-to-tag-submenu-open="isAddToTagSubmenuOpen"
          :on-add-new-document-to-this-tag-click="onAddNewDocumentToThisTagClick"
          :on-add-to-tag-submenu-activator-enter="onAddToTagSubmenuActivatorEnter"
          :on-add-to-tag-submenu-model-update="onAddToTagSubmenuModelUpdate"
          :on-delete-tag-click="onDeleteTagClick"
          :on-rename-tag-click="onRenameTagClick"
          :on-submenu-activator-leave="onSubmenuActivatorLeave"
          :on-submenu-content-enter="onSubmenuContentEnter"
          :on-submenu-content-leave="onSubmenuContentLeave"
          :rename-tag-label="renameTagLabel"
        />
      </q-list>
    `
  })
}
