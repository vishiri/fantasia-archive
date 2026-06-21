<template>
  <q-icon
    class="dialogProjectSettingsWorldTemplateLayoutTreeNode__inputHelpIcon"
    :data-test-locator="props.testLocator"
    :data-test-tooltip-text="props.tooltipText"
    name="mdi-help-circle"
    size="16px"
    @click.stop
  >
    <q-tooltip
      anchor="center right"
      content-class="dialogProjectSettings__fieldHelpTooltip"
      :offset="[12, 0]"
      self="center left"
    >
      {{ props.tooltipText }}
    </q-tooltip>
  </q-icon>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutTreeNodeInputHelpIcon'
})

const props = defineProps<{
  testLocator: string
  tooltipText: string
}>()
</script>
