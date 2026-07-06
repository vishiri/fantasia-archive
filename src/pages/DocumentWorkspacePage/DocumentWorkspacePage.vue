<template>
  <main
    class="documentWorkspacePage q-page column no-wrap q-pa-xl"
    data-test-locator="documentWorkspacePage"
  >
    <h4
      v-if="documentShowsPreview"
      class="documentWorkspacePage__previewTitle q-ma-none"
      data-test-locator="documentWorkspacePage-previewTitle"
    >
      {{ previewDisplayName }}
    </h4>
    <q-input
      v-if="documentShowsEditFields"
      v-model="displayNameModel"
      class="documentWorkspacePage__nameInput"
      data-test-locator="documentWorkspacePage-nameInput"
      :label="nameFieldLabel"
      outlined
      dense
    />
  </main>
</template>

<script lang="ts" setup>
import { useDocumentWorkspacePage } from './scripts/documentWorkspacePage_manager'

defineOptions({
  name: 'DocumentWorkspacePage'
})

const {
  displayNameModel,
  documentShowsEditFields,
  documentShowsPreview,
  nameFieldLabel,
  previewDisplayName
} = useDocumentWorkspacePage()
</script>
