<template>
  <Teleport to="body">
    <div
      v-if="showDocumentControlBar"
      class="projectDocumentControlBar"
      data-test-locator="projectDocumentControlBar"
    />
  </Teleport>
  <div
    v-if="showDocumentControlBar"
    aria-hidden="true"
    class="projectDocumentControlBar__flowSpacer"
  />
</template>

<script setup lang="ts">
import { useProjectDocumentControlBar } from './scripts/projectDocumentControlBar_manager'

defineOptions({
  name: 'ProjectDocumentControlBar'
})

const { showDocumentControlBar } = useProjectDocumentControlBar()
</script>

<style lang="scss" src="./styles/ProjectDocumentControlBar.unscoped.scss"></style>
