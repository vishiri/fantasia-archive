<template>
  <q-dialog
    v-model="dialogOpen"
    data-test-locator="dialogDiscardOpenedDocumentTab"
    @hide="onDialogHide"
  >
    <q-card
      class="dialogDiscardOpenedDocumentTab bg-dark text-accent"
      dark
    >
      <q-card-section class="row justify-center">
        <h6
          class="dialogDiscardOpenedDocumentTab__title text-center q-my-sm"
          data-test-locator="dialogDiscardOpenedDocumentTab-title"
        >
          {{ dialogTitle }}
        </h6>
      </q-card-section>
      <q-card-actions
        align="around"
        class="q-mx-xl q-mt-lg q-mb-md"
      >
        <q-btn
          v-close-popup
          color="accent"
          data-test-locator="dialogDiscardOpenedDocumentTab-cancel"
          flat
          :label="$t('dialogs.discardOpenedDocumentTab.cancelButton')"
        />
        <q-btn
          color="secondary"
          data-test-locator="dialogDiscardOpenedDocumentTab-discard"
          outline
          :label="$t('dialogs.discardOpenedDocumentTab.discardButton')"
          @click="onConfirmDiscard"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogDiscardOpenedDocumentTab } from './scripts/dialogDiscardOpenedDocumentTab_manager'

defineOptions({
  name: 'DialogDiscardOpenedDocumentTab'
})

const {
  dialogOpen,
  dialogTitle,
  onConfirmDiscard,
  onDialogHide
} = useDialogDiscardOpenedDocumentTab()
</script>

<style lang="scss" src="./styles/DialogDiscardOpenedDocumentTab.unscoped.scss"></style>
