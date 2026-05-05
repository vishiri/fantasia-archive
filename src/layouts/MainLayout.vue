<template>
  <q-layout view="hHh Lpr lFf">
    <q-header
      elevated
      dark
      class="bg-dark appHeader"
    >
      <div class="row items-center no-wrap full-width">
        <AppControlMenus class="col-auto" />
        <div
          v-if="activeProjectLabel !== null"
          class="col-auto q-ml-md text-caption fa-text-muted text-no-wrap ellipsis"
          data-test-locator="mainLayout-activeProjectName"
        >
          {{ activeProjectLabel }}
        </div>
      </div>
    </q-header>

    <GlobalLanguageSelector v-if="!isFantasiaStorybookCanvas()" />

    <GlobalWindowButtons />

    <q-drawer
      v-if="mainLayoutShowDrawer"
      data-test-locator="mainLayout-drawer"
      show-if-above
      dark
    >
      <q-list>
        <q-item-label
          header
        >
          {{ $t('mainLayout.drawer.essentialLinksHeader') }}
        </q-item-label>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import {
  createFaKeybindKeydownHandler,
  getFaKeybindKeydownContext
} from 'app/src/scripts/keybinds/faKeybindsGlobalDispatch'
import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/rendererAppInternals'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import AppControlMenus from 'app/src/components/globals/AppControlMenus/AppControlMenus.vue'
import GlobalLanguageSelector from 'app/src/components/globals/GlobalLanguageSelector/GlobalLanguageSelector.vue'
import GlobalWindowButtons from 'app/src/components/globals/GlobalWindowButtons/GlobalWindowButtons.vue'

const route = useRoute()

const { activeProject } = storeToRefs(S_FaActiveProject())

const activeProjectLabel = computed((): string | null => {
  const n = activeProject.value?.name
  if (typeof n !== 'string' || n.length === 0) {
    return null
  }
  return n
})

const mainLayoutShowDrawer = computed(() => {
  return route.meta.faMainLayoutHideDrawer !== true
})

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
  }

  if (window.faContentBridgeAPIs?.faKeybinds !== undefined) {
    const faKeybindsStore = S_FaKeybinds()
    await faKeybindsStore.refreshKeybinds()
    faKeybindKeydownHandler = createFaKeybindKeydownHandler(getFaKeybindKeydownContext)
    window.addEventListener('keydown', faKeybindKeydownHandler, true)
  }

  if (window.faContentBridgeAPIs?.faProgramStyling !== undefined) {
    await S_FaProgramStyling().refreshProgramStyling()
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
