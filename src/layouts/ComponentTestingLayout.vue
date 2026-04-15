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

import {
  applyFaI18nLocaleFromLanguageCode,
  isFaUserSettingsLanguageCode,
  isFantasiaStorybookCanvas
} from 'app/src/scripts/appInternals/rendererAppInternals'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

const route = useRoute()

onMounted(async () => {
  if (isFantasiaStorybookCanvas()) {
    return
  }

  if (process.env.MODE !== 'electron' || window.faContentBridgeAPIs?.faUserSettings === undefined) {
    return
  }

  const faUserSettingsStore = S_FaUserSettings()

  await faUserSettingsStore.refreshSettings()
  const code = faUserSettingsStore.settings?.languageCode

  if (code !== undefined && isFaUserSettingsLanguageCode(code)) {
    applyFaI18nLocaleFromLanguageCode(code)
  }
})
</script>
