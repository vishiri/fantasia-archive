<template>
  <q-dialog
    v-model="dialogOpen"
    data-test-locator="dialogDeleteOpenedDocument"
    @hide="onDialogHide"
  >
    <q-card
      class="dialogDeleteOpenedDocument bg-dark text-accent"
      dark
    >
      <q-card-section class="row justify-center">
        <h6
          class="dialogDeleteOpenedDocument__title text-center q-my-sm"
          data-test-locator="dialogDeleteOpenedDocument-title"
        >
          {{ $t('dialogs.deleteOpenedDocument.titlePrefix') }}
          <span class="text-warning">{{ documentName }}</span>{{ $t('dialogs.deleteOpenedDocument.titleSuffix') }}
        </h6>
      </q-card-section>
      <q-card-section class="dialogDeleteOpenedDocument__body text-center q-pt-none">
        <p
          class="dialogDeleteOpenedDocument__warning q-mb-sm"
          data-test-locator="dialogDeleteOpenedDocument-warning"
        >
          {{ $t('dialogs.deleteOpenedDocument.warningPrefix') }}
          <span class="text-secondary">{{ $t('dialogs.deleteOpenedDocument.foreverWord') }}</span>{{ $t('dialogs.deleteOpenedDocument.warningSuffix') }}
        </p>
        <p class="dialogDeleteOpenedDocument__fallback q-mb-sm">
          {{ $t('dialogs.deleteOpenedDocument.fallbackNote') }}
        </p>
        <p class="dialogDeleteOpenedDocument__proceed q-mb-none">
          {{ $t('dialogs.deleteOpenedDocument.proceedPrompt') }}
        </p>
      </q-card-section>
      <q-card-actions
        align="around"
        class="q-mx-xl q-mt-lg q-mb-md"
      >
        <q-btn
          v-close-popup
          color="accent"
          data-test-locator="dialogDeleteOpenedDocument-cancel"
          flat
          :label="$t('dialogs.deleteOpenedDocument.cancelButton')"
        />
        <q-btn
          color="secondary"
          data-test-locator="dialogDeleteOpenedDocument-delete"
          outline
          :label="$t('dialogs.deleteOpenedDocument.deleteButton')"
          @click="onConfirmDelete"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogDeleteOpenedDocument } from './scripts/dialogDeleteOpenedDocument_manager'

defineOptions({
  name: 'DialogDeleteOpenedDocument'
})

const {
  dialogOpen,
  documentName,
  onConfirmDelete,
  onDialogHide
} = useDialogDeleteOpenedDocument()
</script>

<style lang="scss" src="./styles/DialogDeleteOpenedDocument.unscoped.scss"></style>
