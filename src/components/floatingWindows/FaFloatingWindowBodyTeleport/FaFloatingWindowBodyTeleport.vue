<template>
  <!-- Under #q-app (not nested under q-header); fixed + z-index still use the viewport. Avoids Transition wrapping Teleport. -->
  <Teleport to="#q-app">
    <slot />
  </Teleport>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FaFloatingWindowBodyTeleport'
})
</script>
