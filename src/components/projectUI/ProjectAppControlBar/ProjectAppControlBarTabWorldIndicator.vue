<template>
  <q-icon
    v-if="visible && color !== null"
    aria-hidden="true"
    :class="indicatorClass ?? 'projectAppControlBarTabs__tabWorldIndicator'"
    :data-test-locator="`projectAppControlBar-tabWorldIndicator-${documentId}`"
    name="mdi-earth"
    :style="{ color: color ?? undefined }"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectAppControlBarTabWorldIndicator'
})

defineProps<{
  color: string | null
  documentId: string
  indicatorClass?: string
  visible: boolean
}>()
</script>
