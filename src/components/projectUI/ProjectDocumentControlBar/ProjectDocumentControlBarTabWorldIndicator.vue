<template>
  <q-icon
    v-if="visible && color !== null"
    aria-hidden="true"
    :class="indicatorClass ?? 'projectDocumentControlBarTabs__tabWorldIndicator'"
    :data-test-locator="`projectDocumentControlBar-tabWorldIndicator-${documentId}`"
    name="mdi-earth"
    :style="{ color: color ?? undefined }"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectDocumentControlBarTabWorldIndicator'
})

defineProps<{
  color: string | null
  documentId: string
  indicatorClass?: string
  visible: boolean
}>()
</script>
