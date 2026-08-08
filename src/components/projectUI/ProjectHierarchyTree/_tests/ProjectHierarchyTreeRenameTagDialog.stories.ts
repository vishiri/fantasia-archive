import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import ProjectHierarchyTreeRenameTagDialog from '../ProjectHierarchyTreeRenameTagDialog.vue'

const meta = {
  component: ProjectHierarchyTreeRenameTagDialog,
  parameters: {
    docs: {
      description: {
        component:
          'Rename a hierarchy tree tag. Matching an existing name (case-insensitive) shows a merge warning before confirm.'
      },
      story: {
        iframeHeight: '420px',
        inline: false
      }
    }
  },
  tags: ['autodocs'],
  title: 'Components/projectUI/ProjectHierarchyTreeRenameTagDialog'
} satisfies Meta<typeof ProjectHierarchyTreeRenameTagDialog>

export default meta

function createRenameTagDialogRender (options: {
  canConfirm?: boolean
  nameDraft?: string
  showsMergeWarning?: boolean
  tagName?: string
}) {
  return () => ({
    components: {
      ProjectHierarchyTreeRenameTagDialog
    },
    setup () {
      const isOpen = ref(true)
      const nameDraft = ref(options.nameDraft ?? 'Alpha')
      return {
        canConfirm: options.canConfirm ?? true,
        isOpen,
        nameDraft,
        onCancel: () => {
          isOpen.value = false
        },
        onConfirm: () => {},
        showsMergeWarning: options.showsMergeWarning ?? false,
        tagName: options.tagName ?? 'Alpha'
      }
    },
    template: `
      <ProjectHierarchyTreeRenameTagDialog
        v-model:name-draft="nameDraft"
        :can-confirm="canConfirm"
        :is-open="isOpen"
        :on-cancel="onCancel"
        :on-confirm="onConfirm"
        :shows-merge-warning="showsMergeWarning"
        :tag-name="tagName"
      />
    `
  })
}

export const Default: StoryObj<typeof meta> = {
  render: createRenameTagDialogRender({})
}

export const MergeWarning: StoryObj<typeof meta> = {
  render: createRenameTagDialogRender({
    nameDraft: 'beta',
    showsMergeWarning: true,
    tagName: 'Alpha'
  })
}

export const ConfirmDisabled: StoryObj<typeof meta> = {
  render: createRenameTagDialogRender({
    canConfirm: false,
    nameDraft: '   ',
    tagName: 'Alpha'
  })
}
