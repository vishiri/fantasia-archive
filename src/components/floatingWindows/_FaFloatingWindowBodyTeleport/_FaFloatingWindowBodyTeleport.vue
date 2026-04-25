<template>
  <!--
    document.body always exists before mount (Storybook, tests, Quasar). Avoids #q-app / #fa-app host
    mismatches and keeps position:fixed + z-index out from under q-header / transformed ancestors.
  -->
  <Teleport to="body">
    <slot />
  </Teleport>
</template>

<script setup lang="ts">
defineOptions({
  name: '_FaFloatingWindowBodyTeleport'
})
</script>
