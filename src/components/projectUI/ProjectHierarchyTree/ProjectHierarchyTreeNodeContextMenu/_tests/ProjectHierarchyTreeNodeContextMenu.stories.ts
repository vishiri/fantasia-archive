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

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: {
      ProjectHierarchyTreeNodeContextMenu
    },
    setup () {
      const isOpen = ref(true)
      const menuTargetElement = ref<HTMLElement | null>(null)
      const anchor = document.createElement('div')
      anchor.textContent = 'Right-click target'
      anchor.style.padding = '1rem'
      menuTargetElement.value = anchor
      return {
        anchor,
        isOpen,
        menuTargetElement
      }
    },
    template: `
      <div style="padding: 2rem;">
        <div ref="anchor" />
        <ProjectHierarchyTreeNodeContextMenu
          v-model:is-open="isOpen"
          anchor-node-id="world-1"
          :menu-target-element="menuTargetElement"
          :on-collapse-all-click="() => {}"
          :on-expand-all-click="() => {}"
          :on-hide="() => {}"
        />
      </div>
    `
  })
}
