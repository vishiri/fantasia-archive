<template>
  <div class="dialogProjectSettingsWorldTemplateLayoutTreeNode__canonicalNameField full-width q-mt-sm">
    <q-input
      class="full-width dialogProjectSettingsWorldTemplateLayoutTreeNode__canonicalNameInput"
      color="primary-bright"
      dark
      dense
      disable
      filled
      hide-bottom-space
      :data-test-locator="props.canonicalNameTestLocator"
      :label="props.templateCanonicalNameLabel"
      :model-value="props.templateCanonicalName"
    />
    <div class="dialogProjectSettingsWorldTemplateLayoutTreeNode__canonicalNameFieldHelp">
      <q-icon
        class="dialogProjectSettingsWorldTemplateLayoutTreeNode__inputHelpIcon"
        :data-test-locator="props.canonicalNameTooltipIconTestLocator"
        :data-test-tooltip-text="props.templateCanonicalNameTooltipText"
        name="mdi-help-circle"
        size="16px"
        @click.stop
      >
        <q-tooltip
          :delay="500"
          content-class="dialogProjectSettings__fieldHelpTooltip"
        >
          {{ props.templateCanonicalNameTooltipText }}
        </q-tooltip>
      </q-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutTreeNodeCanonicalNameField'
})

const props = defineProps<{
  canonicalNameTestLocator: string | undefined
  canonicalNameTooltipIconTestLocator: string
  templateCanonicalName: string
  templateCanonicalNameLabel: string
  templateCanonicalNameTooltipText: string
}>()
</script>
