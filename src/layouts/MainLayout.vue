<template>
  <q-layout view="hHh Lpr lFf">
    <q-header
      elevated
      dark
      class="bg-dark appHeader"
    >
      <AppControlMenus />
    </q-header>

    <GlobalLanguageSelector v-if="!isFantasiaStorybookCanvas()" />

    <GlobalWindowButtons />

    <q-drawer
      show-if-above
      dark
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'

import { applyFaI18nLocaleFromLanguageCode } from 'src/scripts/applyFaI18nLocaleFromLanguageCode'
import { isFantasiaStorybookCanvas } from 'src/scripts/isFantasiaStorybookCanvas'
import { isFaUserSettingsLanguageCode } from 'src/scripts/isFaUserSettingsLanguageCode'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

import AppControlMenus from 'components/globals/AppControlMenus/AppControlMenus.vue'
import GlobalLanguageSelector from 'components/globals/GlobalLanguageSelector/GlobalLanguageSelector.vue'
import GlobalWindowButtons from 'components/globals/GlobalWindowButtons/GlobalWindowButtons.vue'

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

<style lang="scss" scoped>
.appHeader {
  -webkit-app-region: drag;

  // Tweak, so the menus will slide nicely behind/from behind the top bar
  z-index: $mainLayout-appHeader-zIndex;
}
</style>
