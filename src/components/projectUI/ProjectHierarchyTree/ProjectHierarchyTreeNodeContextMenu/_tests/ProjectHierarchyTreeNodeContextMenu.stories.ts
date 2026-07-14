import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import ProjectHierarchyTreeNodeContextMenu from '../../ProjectHierarchyTreeNodeContextMenu.vue'

const meta = {
  component: ProjectHierarchyTreeNodeContextMenu,
  parameters: {
    docs: {
      disable: true,
      story: {
        inline: false
      }
    }
  },
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeNodeContextMenu'
} satisfies Meta<typeof ProjectHierarchyTreeNodeContextMenu>

export default meta

function createStoryRender (options: {
  addNewRowIcon?: string | null
  addNewRowLabel?: string | null
}) {
  return () => ({
    components: {
      ProjectHierarchyTreeNodeContextMenu
    },
    setup () {
      const isOpen = ref(true)
      const menuPointerPosition = ref({
        left: 180,
        top: 120
      })
      return {
        addNewRowIcon: options.addNewRowIcon ?? null,
        addNewRowLabel: options.addNewRowLabel ?? null,
        isOpen,
        menuPointerPosition
      }
    },
    template: `
      <div style="padding: 2rem;">
        <ProjectHierarchyTreeNodeContextMenu
          v-model:is-open="isOpen"
          :add-new-row-icon="addNewRowIcon"
          :add-new-row-label="addNewRowLabel"
          anchor-node-id="world-1"
          :menu-pointer-position="menuPointerPosition"
          :on-add-new-click="() => {}"
          :on-collapse-all-click="() => {}"
          :on-expand-all-click="() => {}"
          :on-hide="() => {}"
        />
      </div>
    `
  })
}

export const Default: StoryObj<typeof meta> = {
  render: createStoryRender({})
}

export const WithPlacementAddNew: StoryObj<typeof meta> = {
  render: createStoryRender({
    addNewRowIcon: 'mdi-plus',
    addNewRowLabel: 'Add new building'
  })
}
