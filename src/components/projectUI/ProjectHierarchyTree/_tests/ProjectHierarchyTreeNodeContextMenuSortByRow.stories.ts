import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import type { T_faProjectHierarchyTreeSortByMenuItemId } from 'app/types/I_faProjectHierarchyTreeDomain'

import ProjectHierarchyTreeNodeContextMenuSortByRow from '../ProjectHierarchyTreeNodeContextMenuSortByRow.vue'

const meta = {
  component: ProjectHierarchyTreeNodeContextMenuSortByRow,
  parameters: {
    docs: {
      disable: true,
      story: {
        inline: false
      }
    }
  },
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeNodeContextMenuSortByRow'
} satisfies Meta<typeof ProjectHierarchyTreeNodeContextMenuSortByRow>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: {
      ProjectHierarchyTreeNodeContextMenuSortByRow
    },
    setup () {
      const isSortBySubmenuOpen = ref(false)
      return {
        isSortBySubmenuOpen,
        onSortByItemClick: (_itemId: T_faProjectHierarchyTreeSortByMenuItemId) => {},
        onSortBySubmenuActivatorEnter: () => {
          isSortBySubmenuOpen.value = true
        },
        onSortBySubmenuModelUpdate: (shown: boolean) => {
          isSortBySubmenuOpen.value = shown
        },
        onSubmenuActivatorLeave: () => {},
        onSubmenuContentEnter: () => {},
        onSubmenuContentLeave: () => {},
        resolveSortByItemDetailDirection: () => 'A -> Z',
        resolveSortByItemDetailScope: () => 'direct children',
        resolveSortByItemTitle: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => String(itemId),
        sortByLabel: 'Sort by'
      }
    },
    template: `
      <q-list dark style="max-width: 320px; background: #1d1d1d; padding: 0.5rem;">
        <ProjectHierarchyTreeNodeContextMenuSortByRow
          :is-sort-by-submenu-open="isSortBySubmenuOpen"
          :on-sort-by-item-click="onSortByItemClick"
          :on-sort-by-submenu-activator-enter="onSortBySubmenuActivatorEnter"
          :on-sort-by-submenu-model-update="onSortBySubmenuModelUpdate"
          :on-submenu-activator-leave="onSubmenuActivatorLeave"
          :on-submenu-content-enter="onSubmenuContentEnter"
          :on-submenu-content-leave="onSubmenuContentLeave"
          :resolve-sort-by-item-detail-direction="resolveSortByItemDetailDirection"
          :resolve-sort-by-item-detail-scope="resolveSortByItemDetailScope"
          :resolve-sort-by-item-title="resolveSortByItemTitle"
          :sort-by-label="sortByLabel"
        />
      </q-list>
    `
  })
}
