import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import type { T_faProjectHierarchyTreeSortByMenuItemId } from 'app/types/I_faProjectHierarchyTreeDomain'

import ProjectHierarchyTreeNodeContextMenuSortBySubmenu from '../ProjectHierarchyTreeNodeContextMenuSortBySubmenu.vue'

const meta = {
  component: ProjectHierarchyTreeNodeContextMenuSortBySubmenu,
  parameters: {
    docs: {
      disable: true,
      story: {
        inline: false
      }
    }
  },
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeNodeContextMenuSortBySubmenu'
} satisfies Meta<typeof ProjectHierarchyTreeNodeContextMenuSortBySubmenu>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: {
      ProjectHierarchyTreeNodeContextMenuSortBySubmenu
    },
    setup () {
      const isSortBySubmenuOpen = ref(true)
      return {
        isSortBySubmenuOpen,
        onSortByItemClick: (_itemId: T_faProjectHierarchyTreeSortByMenuItemId) => {},
        onSortBySubmenuModelUpdate: (shown: boolean) => {
          isSortBySubmenuOpen.value = shown
        },
        onSubmenuContentEnter: () => {},
        onSubmenuContentLeave: () => {},
        resolveSortByItemDetailDirection: () => 'A -> Z',
        resolveSortByItemDetailScope: () => 'direct children',
        resolveSortByItemTitle: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => String(itemId),
        sortByDirectScopeOnly: false
      }
    },
    template: `
      <div style="padding: 2rem;">
        <ProjectHierarchyTreeNodeContextMenuSortBySubmenu
          :is-sort-by-submenu-open="isSortBySubmenuOpen"
          :on-sort-by-item-click="onSortByItemClick"
          :on-sort-by-submenu-model-update="onSortBySubmenuModelUpdate"
          :on-submenu-content-enter="onSubmenuContentEnter"
          :on-submenu-content-leave="onSubmenuContentLeave"
          :resolve-sort-by-item-detail-direction="resolveSortByItemDetailDirection"
          :resolve-sort-by-item-detail-scope="resolveSortByItemDetailScope"
          :resolve-sort-by-item-title="resolveSortByItemTitle"
          :sort-by-direct-scope-only="sortByDirectScopeOnly"
        />
      </div>
    `
  })
}
