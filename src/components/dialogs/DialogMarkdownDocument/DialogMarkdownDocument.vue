<template>
  <!-- Dialog wrapper -->
  <q-dialog
    v-model="dialogModel"
    :class="['dialogMarkdownDocument', `${documentName}`]"
    :aria-label="dialogAriaLabel"
  >
    <q-card>
      <!-- Dialog contents wrapper -->
      <q-card-section :class="['dialogMarkdownDocument__content', `${documentName}`, 'q-mt-xl', 'q-mb-lg', 'q-mr-lg', 'q-ml-xl', 'q-pt-none']">
        <div
          class="flex justify-center"
          data-test-locator="dialogMarkdownDocument-markdown-wrapper"
        >
          <!-- Dialog markdown -->
          <q-markdown
            no-heading-anchor-links
            data-test-locator="dialogMarkdownDocument-markdown-content"
            :class="[`${documentName}`, 'dialogMarkdownDocument']"
            :src="$t(`documents.${documentName}`)"
          />
        </div>
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
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
import '@quasar/quasar-ui-qmarkdown/dist/index.css'
import type { T_documentName } from 'app/types/T_appDialogsAndDocuments'
import { i18n } from 'app/i18n/externalFileLoader'
import { registerDialogMarkdownDocumentOpenLease } from 'app/src/scripts/appInfo/registerDialogMarkdownDocumentOpenLease'
import { S_DialogMarkdown } from 'src/stores/S_Dialog'
import { computed, onMounted, ref, watch } from 'vue'
import type { StoreGeneric } from 'pinia'

const resolveDialogMarkdownStore = (): StoreGeneric | null => {
  try {
    return S_DialogMarkdown()
  } catch {
    return null
  }
}

/**
 * All component props
 */
const props = defineProps<{
  /**
   * Custom input directly fed to the component in case it doesn't get triggered from the global store
   */
  directInput?: T_documentName
}>()

/**
 * Model for the current popup dialog
 */
const dialogModel = ref(false)

registerDialogMarkdownDocumentOpenLease(dialogModel)

/**
 * Name of the document shown inside the dialog
 */
const documentName = ref('')

const dialogAriaLabel = computed(() => {
  switch (documentName.value) {
    case 'advancedSearchCheatSheet':
      return i18n.global.t('dialogs.markdownDocument.ariaLabels.advancedSearchCheatSheet')
    case 'advancedSearchGuide':
      return i18n.global.t('dialogs.markdownDocument.ariaLabels.advancedSearchGuide')
    case 'changeLog':
      return i18n.global.t('dialogs.markdownDocument.ariaLabels.changeLog')
    case 'license':
      return i18n.global.t('dialogs.markdownDocument.ariaLabels.license')
    case 'tipsTricksTrivia':
      return i18n.global.t('dialogs.markdownDocument.ariaLabels.tipsTricksTrivia')
    default:
      return i18n.global.t('dialogs.markdownDocument.ariaLabels.fallback')
  }
})

/**
 * Opens the popup dialog via direct input-feed
 */
const openDialog = (input: T_documentName) => {
  documentName.value = input
  dialogModel.value = true
}

/**
 * Trigger dialog popup via reaction to store update
 */
watch(() => resolveDialogMarkdownStore()?.dialogUUID, () => {
  const dialogMarkdownStore = resolveDialogMarkdownStore()
  if (typeof dialogMarkdownStore?.documentToOpen === 'string' && dialogMarkdownStore.documentToOpen !== '') {
    openDialog(dialogMarkdownStore.documentToOpen as T_documentName)
  }
})

/**
 * Trigger dialog popup via reaction to direct prop feed
 */
watch(() => props.directInput, () => {
  if (props.directInput !== undefined && props.directInput !== '') {
    openDialog(props.directInput)
  }
})

/**
 * Checks the prop feed-status on the first mount and open the dialog if the prop is properly fed in
 * This exists mostly due to component tests being flaky otherwise
 */
onMounted(() => {
  if (props.directInput !== undefined && props.directInput !== '') {
    openDialog(props.directInput)
  }
})

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
