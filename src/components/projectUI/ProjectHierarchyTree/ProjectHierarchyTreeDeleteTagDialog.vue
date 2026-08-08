<template>
  <q-dialog
    :model-value="isOpen"
    data-test-locator="projectHierarchyTree-deleteTagDialog"
    @hide="onCancel"
    @update:model-value="onOpenModelUpdate"
  >
    <q-card
      class="faConfirmationDialog projectHierarchyTreeDeleteTagDialog bg-dark text-accent"
      dark
    >
      <div class="faConfirmationDialog__content">
        <q-card-section class="row justify-center">
          <h6
            class="projectHierarchyTreeDeleteTagDialog__title text-center q-my-sm"
            data-test-locator="projectHierarchyTree-deleteTagDialog-title"
          >
            {{ $t('projectUI.projectHierarchyTree.deleteTagConfirm.titlePrefix') }}
            <span class="text-primary-bright">{{ tagName }}</span>{{ $t('projectUI.projectHierarchyTree.deleteTagConfirm.titleSuffix') }}
          </h6>
        </q-card-section>
        <q-card-section class="faConfirmationDialog__body projectHierarchyTreeDeleteTagDialog__body text-left">
          <p
            class="projectHierarchyTreeDeleteTagDialog__warning q-mb-none"
            data-test-locator="projectHierarchyTree-deleteTagDialog-warning"
          >
            {{ $t('projectUI.projectHierarchyTree.deleteTagConfirm.warningPrefix') }}
            <span class="text-secondary">{{ $t('projectUI.projectHierarchyTree.deleteTagConfirm.foreverWord') }}</span>{{ $t('projectUI.projectHierarchyTree.deleteTagConfirm.warningSuffix') }}
          </p>
          <p
            class="projectHierarchyTreeDeleteTagDialog__proceed q-mb-none"
            data-test-locator="projectHierarchyTree-deleteTagDialog-proceed"
          >
            {{ $t('projectUI.projectHierarchyTree.deleteTagConfirm.proceedPrompt') }}
          </p>
        </q-card-section>
      </div>
      <q-card-actions
        align="around"
        class="q-mx-xl q-mt-lg q-mb-md"
      >
        <q-btn
          v-close-popup
          color="accent"
          data-test-locator="projectHierarchyTree-deleteTagDialog-cancel"
          flat
          :label="$t('projectUI.projectHierarchyTree.deleteTagConfirm.cancelButton')"
          @click="onCancel"
        />
        <q-btn
          color="secondary"
          data-test-locator="projectHierarchyTree-deleteTagDialog-confirm"
          outline
          :label="$t('projectUI.projectHierarchyTree.deleteTagConfirm.deleteButton')"
          @click="onConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectHierarchyTreeDeleteTagDialog'
})

const props = defineProps<{
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  tagName: string
}>()

function onOpenModelUpdate (shown: boolean): void {
  if (!shown) {
    props.onCancel()
  }
}
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeDeleteTagDialog.unscoped.scss"></style>
