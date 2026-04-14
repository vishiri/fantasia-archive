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
import { onMounted, onUnmounted } from 'vue'

import { createFaKeybindKeydownHandler } from 'src/scripts/keybinds/faKeybindHandleKeydown'
import { getFaKeybindKeydownContext } from 'src/scripts/keybinds/faKeybindKeydownContext'
import { applyFaI18nLocaleFromLanguageCode } from 'src/scripts/applyFaI18nLocaleFromLanguageCode'
import { isFantasiaStorybookCanvas } from 'src/scripts/isFantasiaStorybookCanvas'
import { isFaUserSettingsLanguageCode } from 'src/scripts/isFaUserSettingsLanguageCode'
import { S_FaKeybinds } from 'src/stores/S_FaKeybinds'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

import AppControlMenus from 'components/globals/AppControlMenus/AppControlMenus.vue'
import GlobalLanguageSelector from 'components/globals/GlobalLanguageSelector/GlobalLanguageSelector.vue'
import GlobalWindowButtons from 'components/globals/GlobalWindowButtons/GlobalWindowButtons.vue'

let faKeybindKeydownHandler: ((event: KeyboardEvent) => void) | undefined

onMounted(async () => {
  if (isFantasiaStorybookCanvas()) {
    return
  }

  if (process.env.MODE !== 'electron') {
    return
  }

  if (window.faContentBridgeAPIs?.faUserSettings !== undefined) {
    const faUserSettingsStore = S_FaUserSettings()

    await faUserSettingsStore.refreshSettings()
    const code = faUserSettingsStore.settings?.languageCode

    if (code !== undefined && isFaUserSettingsLanguageCode(code)) {
      applyFaI18nLocaleFromLanguageCode(code)
    }
  }

  if (window.faContentBridgeAPIs?.faKeybinds !== undefined) {
    const faKeybindsStore = S_FaKeybinds()
    await faKeybindsStore.refreshKeybinds()
    faKeybindKeydownHandler = createFaKeybindKeydownHandler(getFaKeybindKeydownContext)
    window.addEventListener('keydown', faKeybindKeydownHandler, true)
  }
})

onUnmounted(() => {
  if (faKeybindKeydownHandler !== undefined) {
    window.removeEventListener('keydown', faKeybindKeydownHandler, true)
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
