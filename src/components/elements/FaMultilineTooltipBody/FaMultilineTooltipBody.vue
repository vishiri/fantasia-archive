<template>
  <template v-if="bodyLines.length > 1">
    <div :class="props.introClass">
      {{ bodyLines[0] }}
    </div>
    <div
      v-for="(line, lineIndex) in bodyBulletLines"
      :key="lineIndex"
      :class="props.bulletClass"
    >
      {{ line }}
    </div>
  </template>
  <template v-else>
    {{ props.text }}
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'FaMultilineTooltipBody'
})

const props = withDefaults(
  defineProps<{
    bulletClass?: string
    introClass?: string
    text: string
  }>(),
  {
    bulletClass: 'faMultilineTooltipBody__bullet',
    introClass: 'faMultilineTooltipBody__intro'
  }
)

const bodyLines = computed(() => {
  return props.text.split(/\r?\n/).filter((line) => line.length > 0)
})

const bodyBulletLines = computed(() => {
  return bodyLines.value.slice(1)
})
</script>

<style lang="scss" src="./styles/FaMultilineTooltipBody.unscoped.scss"></style>
