<template>
  <div
    class="flex justify-center"
    data-test-locator="dialogMarkdownDocument-markdown-wrapper"
  >
    <q-markdown
      no-heading-anchor-links
      data-test-locator="dialogMarkdownDocument-markdown-content"
      :class="[documentName, 'dialogMarkdownDocument']"
      :src="$t(`documents.${documentName}`)"
    />
  </div>
</template>

<script setup lang="ts">
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
import '@quasar/quasar-ui-qmarkdown/dist/index.css'

defineProps<{
  documentName: string
}>()
</script>
