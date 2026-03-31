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
          data-test="dialogMarkdownDocument-markdown-wrapper"
        >
          <!-- Dialog markdown -->
          <q-markdown
            no-heading-anchor-links
            data-test="dialogMarkdownDocument-markdown-content"
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
          label="Close"
          color="accent"
          data-test="dialogMarkdownDocument-button-close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
import '@quasar/quasar-ui-qmarkdown/dist/index.css'
import { T_documentName } from 'app/types/T_documentList'
import { S_DialogMarkdown } from 'src/stores/S_Dialog'
import { computed, onMounted, ref, watch } from 'vue'

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

/**
 * Name of the document shown inside the dialog
 */
const documentName = ref('')

const dialogAriaLabel = computed(() => {
  switch (documentName.value) {
    case 'advancedSearchCheatSheet':
      return 'Advanced Search Cheat Sheet'
    case 'advancedSearchGuide':
      return 'Advanced Search Guide'
    case 'changeLog':
      return 'Changelog'
    case 'license':
      return 'License'
    case 'tipsTricksTrivia':
      return 'Tips, Tricks and Trivia'
    default:
      return 'Markdown document dialog'
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
watch(() => S_DialogMarkdown.dialogUUID, () => {
  openDialog(S_DialogMarkdown.documentToOpen)
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
    max-width: calc(100vw - 100px) !important;
  }

  &.license .q-card {
    width: 680px;
  }

  &.changeLog .q-markdown {
    width: 100%;
  }

  &.changeLog .q-card {
    width: 1100px;
  }

  &.advancedSearchGuide .q-card {
    width: 1100px;
  }

  &.tipsTricksTrivia .q-card {
    width: 1100px;
  }

  &__content {
    overflow: auto;
    max-height: calc(100vh - 235px);
    min-height: 650px;

    &.tipsTricksTrivia {
      padding-right: 40px;
    }

    &.changeLog {
      padding-right: 40px;
    }

    &.advancedSearchGuide {
      padding-right: 40px;
    }
  }
}

</style>
