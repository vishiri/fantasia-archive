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
  anchorNodeId?: string
  showsBulkExpandRows?: boolean
  showsCopyRows?: boolean
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
        anchorNodeId: options.anchorNodeId ?? 'world-1',
        isOpen,
        menuPointerPosition,
        showsBulkExpandRows: options.showsBulkExpandRows ?? true,
        showsCopyRows: options.showsCopyRows ?? false
      }
    },
    template: `
      <div style="padding: 2rem;">
        <ProjectHierarchyTreeNodeContextMenu
          v-model:is-open="isOpen"
          :add-new-row-icon="addNewRowIcon"
          :add-new-row-label="addNewRowLabel"
          :anchor-node-id="anchorNodeId"
          :menu-pointer-position="menuPointerPosition"
          :on-add-new-click="() => {}"
          :on-add-new-document-under-this-click="() => {}"
          :on-collapse-all-click="() => {}"
          :on-copy-background-color-click="() => {}"
          :on-copy-document-click="() => {}"
          :on-copy-name-click="() => {}"
          :on-copy-text-color-click="() => {}"
          :on-delete-document-click="() => {}"
          :on-edit-document-click="() => {}"
          :on-expand-all-click="() => {}"
          :on-hide="() => {}"
          :on-open-document-click="() => {}"
          :shows-bulk-expand-rows="showsBulkExpandRows"
          :shows-copy-rows="showsCopyRows"
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

export const LeafDocumentCopyOnly: StoryObj<typeof meta> = {
  render: createStoryRender({
    anchorNodeId: 'doc-leaf',
    showsBulkExpandRows: false,
    showsCopyRows: true
  })
}

export const ParentDocumentExpandAndCopy: StoryObj<typeof meta> = {
  render: createStoryRender({
    anchorNodeId: 'doc-parent',
    showsBulkExpandRows: true,
    showsCopyRows: true
  })
}
