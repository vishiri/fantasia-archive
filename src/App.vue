<template>
  <FaUserCssInjector v-if="mountUserCssInjector" />
  <router-view />
</template>

<script lang="ts" setup>
// Initial navigation uses TEST_ENV from the Electron bridge; see boot/faRoutingEnv.ts.
import { computed } from 'vue'

import FaUserCssInjector from 'app/src/components/globals/_FaUserCssInjector/_FaUserCssInjector.vue'
import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/rendererAppInternals'

// User CSS is meaningful only inside the real Electron renderer; Storybook canvas mounts skip it so the shared style element does not bleed across previews.
const mountUserCssInjector = computed((): boolean => {
  if (isFantasiaStorybookCanvas()) {
    return false
  }
  return process.env.MODE === 'electron'
})
</script>
