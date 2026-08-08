<template>
  <div class="projectHierarchyTreeTagDialogsHost">
    <ProjectHierarchyTreeRenameTagDialog
      v-model:name-draft="renameTagNameDraftModel"
      :can-confirm="renameTagCanConfirm"
      :is-open="renameTagDialogOpen"
      :on-cancel="onDismissRenameTagDialog"
      :on-confirm="onConfirmRenameTag"
      :shows-merge-warning="renameTagMergeWarning"
      :tag-name="renameTagCurrentName"
    />
    <ProjectHierarchyTreeDeleteTagDialog
      :is-open="deleteTagConfirmOpen"
      :on-cancel="onDismissDeleteTagDialog"
      :on-confirm="onConfirmDeleteTag"
      :tag-name="deleteTagName"
    />
  </div>
</template>

<script setup lang="ts">
import ProjectHierarchyTreeDeleteTagDialog from './ProjectHierarchyTreeDeleteTagDialog.vue'
import ProjectHierarchyTreeRenameTagDialog from './ProjectHierarchyTreeRenameTagDialog.vue'

defineOptions({
  name: 'ProjectHierarchyTreeTagDialogsHost'
})

defineProps<{
  deleteTagConfirmOpen: boolean
  deleteTagName: string
  onConfirmDeleteTag: () => void
  onConfirmRenameTag: () => void
  onDismissDeleteTagDialog: () => void
  onDismissRenameTagDialog: () => void
  renameTagCanConfirm: boolean
  renameTagCurrentName: string
  renameTagDialogOpen: boolean
  renameTagMergeWarning: boolean
}>()

const renameTagNameDraftModel = defineModel<string>('renameTagNameDraft', {
  required: true
})
</script>
