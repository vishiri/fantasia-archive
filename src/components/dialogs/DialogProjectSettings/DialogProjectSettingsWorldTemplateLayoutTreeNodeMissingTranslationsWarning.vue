<template>
  <q-icon
    class="dialogProjectSettingsWorldTemplateLayoutTreeNode__missingTranslationsWarningHost dialogProjectSettingsWorldTemplateLayoutTreeNode__missingTranslationsWarning"
    color="warning"
    :data-test-locator="props.testLocator"
    :data-test-tooltip-text="props.tooltipText"
    name="mdi-alert"
    size="16px"
    @click.stop
  >
    <q-tooltip content-class="dialogProjectSettings__fieldHelpTooltip">
      <FaMultilineTooltipBody :text="props.tooltipText" />
    </q-tooltip>
  </q-icon>
</template>

<script setup lang="ts">
import FaMultilineTooltipBody from 'app/src/components/elements/FaMultilineTooltipBody/FaMultilineTooltipBody.vue'
defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning'
})

const props = defineProps<{
  testLocator: string
  tooltipText: string
}>()
</script>
