<template>
  <q-layout>
    <q-page-container>
      <router-view :key="route.path" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/rendererAppInternals'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

const route = useRoute()

onMounted(async () => {
  if (isFantasiaStorybookCanvas()) {
    return
  }

  if (process.env.MODE !== 'electron') {
    return
  }

  if (window.faContentBridgeAPIs?.faUserSettings !== undefined) {
    await S_FaUserSettings().refreshSettings()
  }

  if (window.faContentBridgeAPIs?.faKeybinds !== undefined) {
    await S_FaKeybinds().refreshKeybinds()
  }
})
</script>
