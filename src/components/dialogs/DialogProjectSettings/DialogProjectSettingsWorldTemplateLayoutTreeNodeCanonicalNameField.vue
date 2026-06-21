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
      stack-label
    />
    <div class="dialogProjectSettingsWorldTemplateLayoutTreeNode__canonicalNameFieldHelp">
      <DialogProjectSettingsWorldTemplateLayoutTreeNodeInputHelpIcon
        :test-locator="props.canonicalNameTooltipIconTestLocator"
        :tooltip-text="props.templateCanonicalNameTooltipText"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DialogProjectSettingsWorldTemplateLayoutTreeNodeInputHelpIcon from './DialogProjectSettingsWorldTemplateLayoutTreeNodeInputHelpIcon.vue'

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
