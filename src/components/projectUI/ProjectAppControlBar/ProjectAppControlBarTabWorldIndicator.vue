<template>
  <q-icon
    v-if="visible && color !== null"
    aria-hidden="true"
    :class="indicatorClass ?? 'projectAppControlBarTabs__tabWorldIndicator'"
    :data-test-locator="`projectAppControlBar-tabWorldIndicator-${documentId}`"
    name="mdi-earth"
    :style="indicatorStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'ProjectAppControlBarTabWorldIndicator'
})

const props = defineProps<{
  color: string | null
  documentId: string
  indicatorClass?: string
  visible: boolean
}>()

const indicatorStyle = computed(() => ({
  '--fa-color-glyph-base': props.color ?? ''
}))
</script>
