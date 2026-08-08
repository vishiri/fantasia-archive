import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import ProjectHierarchyTreeNodeContextMenu from '../ProjectHierarchyTreeNodeContextMenu.vue'

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
  addDocumentPlacementOptions?: Array<{
    icon: string
    label: string
    nodeId: string
  }>
  addNewRowIcon?: string | null
  addNewRowLabel?: string | null
  anchorNodeId?: string
  showsBulkExpandRows?: boolean
  showsCopyRows?: boolean
  showsSortByRows?: boolean
  showsTagMenuRows?: boolean
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
        addDocumentPlacementOptions: options.addDocumentPlacementOptions ?? [],
        addNewRowIcon: options.addNewRowIcon ?? null,
        addNewRowLabel: options.addNewRowLabel ?? null,
        anchorNodeId: options.anchorNodeId ?? 'world-1',
        isOpen,
        menuPointerPosition,
        showsBulkExpandRows: options.showsBulkExpandRows ?? true,
        showsCopyRows: options.showsCopyRows ?? false,
        showsDocumentOpenEditRows: false,
        showsSortByRows: options.showsSortByRows ?? false,
        sortByDirectScopeOnly: false,
        showsTagMenuRows: options.showsTagMenuRows ?? false
      }
    },
    template: `
      <div style="padding: 2rem;">
        <ProjectHierarchyTreeNodeContextMenu
          v-model:is-open="isOpen"
          :add-document-placement-options="addDocumentPlacementOptions"
          :add-new-row-icon="addNewRowIcon"
          :add-new-row-label="addNewRowLabel"
          :anchor-node-id="anchorNodeId"
          :menu-pointer-position="menuPointerPosition"
          :on-add-new-click="() => {}"
          :on-add-new-document-to-this-tag-click="() => {}"
          :on-add-new-document-under-this-click="() => {}"
          :on-collapse-all-click="() => {}"
          :on-copy-background-color-click="() => {}"
          :on-copy-document-click="() => {}"
          :on-copy-name-click="() => {}"
          :on-copy-text-color-click="() => {}"
          :on-delete-document-click="() => {}"
          :on-delete-tag-click="() => {}"
          :on-edit-document-click="() => {}"
          :on-expand-all-click="() => {}"
          :on-hide="() => {}"
          :on-open-document-click="() => {}"
          :on-rename-tag-click="() => {}"
          :on-sort-by-item-click="() => {}"
          :shows-bulk-expand-rows="showsBulkExpandRows"
          :shows-copy-rows="showsCopyRows"
          :shows-document-open-edit-rows="showsDocumentOpenEditRows"
          :shows-sort-by-rows="showsSortByRows"
          :sort-by-direct-scope-only="sortByDirectScopeOnly"
          :shows-tag-menu-rows="showsTagMenuRows"
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
    addNewRowLabel: 'Add new building',
    showsSortByRows: true
  })
}

export const LeafDocumentCopyOnly: StoryObj<typeof meta> = {
  render: createStoryRender({
    anchorNodeId: 'doc-leaf',
    showsBulkExpandRows: false,
    showsCopyRows: true,
    showsSortByRows: true
  })
}

/** Tag node: add-to-tag / rename / delete rows. */
export const TagNodeMenu: StoryObj<typeof meta> = {
  render: createStoryRender({
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
    anchorNodeId: 'tag-alpha',
    showsBulkExpandRows: true,
    showsSortByRows: true,
    showsTagMenuRows: true
  })
}
