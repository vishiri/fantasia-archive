<template>
  <div
    class="dialogProjectSettingsWorldTemplateLayoutTreeNode__labelArea row items-center no-wrap col"
    :data-test-locator="`${props.nodeTestLocator}-labelArea`"
  >
    <q-icon
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__icon"
      :class="{ 'dialogProjectSettingsWorldTemplateLayoutTreeNode__icon--nickname': props.node.usesNickname }"
      :name="props.displayIconName"
    />
    <span
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__label col ellipsis"
      :class="{ 'dialogProjectSettingsWorldTemplateLayoutTreeNode__label--nickname': props.node.usesNickname }"
    >
      {{ props.node.label }}
    </span>
    <span
      v-if="props.node.nodeKind === 'template' && props.node.documentCountInWorld > 0"
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__count fa-text-muted q-mr-sm"
      :data-test-locator="`${props.nodeTestLocator}-count`"
    >
      ({{ props.node.documentCountInWorld }})
    </span>
  </div>
</template>

<script setup lang="ts">
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea'
})

const props = defineProps<{
  displayIconName: string
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  nodeTestLocator: string
}>()
</script>
