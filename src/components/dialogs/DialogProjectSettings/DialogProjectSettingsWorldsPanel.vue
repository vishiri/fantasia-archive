<template>
  <div class="dialogProjectSettings__worldsPanel">
    <h6
      class="dialogProjectSettings__panelTitle text-bold q-mb-none text-subtitle1 text-primary-bright"
      data-test-locator="dialogProjectSettings-panel-worlds-title"
    >
      {{ $t('dialogs.projectSettings.panels.worlds.title') }}
    </h6>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DialogProjectSettingsWorldsPanel'
})
</script>

<style lang="scss" src="./styles/DialogProjectSettings.panelTitle.unscoped.scss"></style>
