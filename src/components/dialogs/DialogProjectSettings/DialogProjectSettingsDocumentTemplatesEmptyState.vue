<template>
  <div
    class="dialogProjectSettingsDocumentTemplatesEmptyState"
    data-test-locator="dialogProjectSettings-documentTemplates-emptyState"
  >
    <q-btn
      outline
      class="dialogProjectSettingsDocumentTemplatesEmptyState__button"
      color="primary-bright"
      no-caps
      size="xl"
      :label="$t('dialogs.projectSettings.panels.documentTemplates.addFirstTemplateButton')"
      data-test-locator="dialogProjectSettings-documentTemplates-addFirstButton"
      @click="emit('addTemplate')"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DialogProjectSettingsDocumentTemplatesEmptyState'
})

const emit = defineEmits<{
  addTemplate: []
}>()
</script>

<style lang="scss" src="./styles/DialogProjectSettings.documentTemplatesEmptyState.unscoped.scss"></style>
