<template>
  <!-- Dialog wrapper -->
  <q-dialog
    v-model="dialogModel"
    :class="['dialogMarkdownDocument', `${documentName}`]"
    :aria-label="dialogAriaLabel"
  >
    <q-card>
      <!-- Dialog contents wrapper -->
      <q-card-section :class="['dialogMarkdownDocument__content', `${documentName}`, 'q-mt-xl', 'q-mb-lg', 'q-mr-lg', 'q-ml-xl', 'q-pt-none', 'hasScrollbar']">
        <DialogMarkdownDocumentContent :document-name="documentName" />
      </q-card-section>

      <!-- Card actions wrapper -->
      <q-card-actions
        align="around"
        class="q-mb-lg"
      >
        <!-- Close button -->
        <q-btn
          v-close-popup
          flat
          :label="$t('dialogs.markdownDocument.closeButton')"
          color="accent"
          data-test-locator="dialogMarkdownDocument-button-close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { T_documentName } from 'app/types/T_appDialogsAndDocuments'

import DialogMarkdownDocumentContent from './DialogMarkdownDocumentContent.vue'
import { useDialogMarkdownDocument } from './scripts/dialogMarkdownDocument_manager'

const props = defineProps<{
  /**
   * Custom input directly fed to the component in case it doesn't get triggered from the global store
   */
  directInput?: T_documentName
}>()

const {
  dialogAriaLabel,
  dialogModel,
  documentName
} = useDialogMarkdownDocument(props)
</script>

<style lang="scss">
.dialogMarkdownDocument {
  .q-markdown,
  .q-markdown * {
    color: $qMarkdown-color !important;
    opacity: 1 !important;
  }

  .q-markdown a {
    color: $aLinkColor !important;
  }

  .q-markdown .q-markdown--token,
  .q-markdown code.q-markdown--token {
    color: $qMarkdown-code-textColor !important;
  }

  .q-markdown pre code {
    color: $qMarkdown-color !important;
  }

  .q-card {
    max-width: calc(100vw - #{$dialogMarkdownDocument-card-maxWidthViewportSubtract}) !important;
  }

  &.license .q-card {
    width: $dialogMarkdownDocument-license-card-width;
  }

  &.changeLog .q-markdown {
    width: 100%;
  }

  &.changeLog .q-card {
    width: $dialogMarkdownDocument-changeLog-card-width;
  }

  &.advancedSearchGuide .q-card {
    width: $dialogMarkdownDocument-changeLog-card-width;
  }

  &.tipsTricksTrivia .q-card {
    width: $dialogMarkdownDocument-changeLog-card-width;
  }

  &__content {
    max-height: calc(100vh - #{$dialogMarkdownDocument-content-maxHeightSubtract});
    min-height: $dialogMarkdownDocument-content-minHeight;
    overflow: auto;

    &.tipsTricksTrivia {
      padding-right: $dialogMarkdownDocument-content-paddingRight;
    }

    &.changeLog {
      padding-right: $dialogMarkdownDocument-content-paddingRight;
    }

    &.advancedSearchGuide {
      padding-right: $dialogMarkdownDocument-content-paddingRight;
    }
  }
}

</style>
