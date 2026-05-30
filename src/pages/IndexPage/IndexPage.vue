<template>
  <main class="indexPage q-page column items-center no-wrap q-pa-xl">
    <ProjectOverview />
  </main>
</template>

<script lang="ts" setup>
import ProjectOverview from 'app/src/components/projectUI/ProjectOverview/ProjectOverview.vue'

defineOptions({
  name: 'IndexPage'
})
</script>
