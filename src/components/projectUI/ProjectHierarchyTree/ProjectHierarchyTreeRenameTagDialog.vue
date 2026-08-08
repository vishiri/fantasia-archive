<template>
  <q-dialog
    :model-value="isOpen"
    data-test-locator="projectHierarchyTree-renameTagDialog"
    @hide="onCancel"
    @show="onDialogShow"
    @update:model-value="onOpenModelUpdate"
  >
    <q-card
      class="faConfirmationDialog projectHierarchyTreeRenameTagDialog bg-dark text-accent"
      dark
    >
      <div class="faConfirmationDialog__content">
        <q-card-section class="row justify-center">
          <h6
            class="projectHierarchyTreeRenameTagDialog__title text-center q-my-sm"
            data-test-locator="projectHierarchyTree-renameTagDialog-title"
          >
            {{ $t('projectUI.projectHierarchyTree.renameTagDialog.title') }}
          </h6>
          <p
            class="projectHierarchyTreeRenameTagDialog__currentName text-primary-bright text-center q-mb-none"
            data-test-locator="projectHierarchyTree-renameTagDialog-currentName"
          >
            {{ tagName }}
          </p>
        </q-card-section>
        <q-card-section class="faConfirmationDialog__body projectHierarchyTreeRenameTagDialog__body text-center">
          <p
            class="projectHierarchyTreeRenameTagDialog__description"
            data-test-locator="projectHierarchyTree-renameTagDialog-description"
          >
            {{ $t('projectUI.projectHierarchyTree.renameTagDialog.description') }}
          </p>
          <div class="projectHierarchyTreeRenameTagDialog__field">
            <q-input
              ref="nameInputRef"
              v-model="nameDraftModel"
              autofocus
              class="projectHierarchyTreeRenameTagDialog__input"
              color="primary-bright"
              dark
              data-test-locator="projectHierarchyTree-renameTagDialog-name"
              filled
              :label="$t('projectUI.projectHierarchyTree.renameTagDialog.nameLabel')"
              @keydown.enter="onEnterConfirm"
            >
              <template
                v-if="showsMergeWarning"
                #append
              >
                <q-icon
                  class="projectHierarchyTreeRenameTagDialog__mergeWarning text-primary-bright cursor-pointer"
                  data-test-locator="projectHierarchyTree-renameTagDialog-mergeWarning"
                  name="mdi-alert"
                >
                  <q-tooltip>
                    {{ $t('projectUI.projectHierarchyTree.renameTagDialog.mergeWarningTooltip') }}
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </div>
        </q-card-section>
      </div>
      <q-card-actions
        align="around"
        class="q-mx-xl q-mt-lg q-mb-md"
      >
        <q-btn
          v-close-popup
          color="accent"
          data-test-locator="projectHierarchyTree-renameTagDialog-cancel"
          flat
          :label="$t('projectUI.projectHierarchyTree.renameTagDialog.cancel')"
          @click="onCancel"
        />
        <q-btn
          color="primary-bright"
          data-test-locator="projectHierarchyTree-renameTagDialog-confirm"
          :disable="!canConfirm"
          outline
          :label="$t('projectUI.projectHierarchyTree.renameTagDialog.confirm')"
          @click="onConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

defineOptions({
  name: 'ProjectHierarchyTreeRenameTagDialog'
})

const props = defineProps<{
  canConfirm: boolean
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  showsMergeWarning: boolean
  tagName: string
}>()

const nameDraftModel = defineModel<string>('nameDraft', {
  required: true
})

const nameInputRef = ref<{ focus: () => void } | null>(null)

async function onDialogShow (): Promise<void> {
  await nextTick()
  nameInputRef.value?.focus()
}

function onOpenModelUpdate (shown: boolean): void {
  if (!shown) {
    props.onCancel()
  }
}

function onEnterConfirm (): void {
  if (!props.canConfirm) {
    return
  }
  props.onConfirm()
}
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeRenameTagDialog.unscoped.scss"></style>
