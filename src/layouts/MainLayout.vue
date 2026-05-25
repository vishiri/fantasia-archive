<template>
  <q-layout
    :view="appShellLayoutQuasarView"
    class="appShellLayout"
    :class="appShellLayoutRouteClass"
    data-test-locator="mainLayout"
  >
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
      :model-value="showWorkspaceDrawer"
      data-test-locator="mainLayout-drawer"
      dark
      :transition-duration="FA_APP_SHELL_DRAWER_TRANSITION_MS"
      transition-hide="slide-left"
      transition-show="slide-right"
    >
      <q-list>
        <q-item-label
          header
        >
          {{ $t('mainLayout.drawer.essentialLinksHeader') }}
        </q-item-label>
      </q-list>
    </q-drawer>

    <q-page-container class="appShellLayout__pageContainer">
      <div class="appShellLayout__pageTransitionHost">
        <router-view v-slot="{ Component, route: childRoute }">
          <Transition
            v-bind="FA_APP_SHELL_PAGE_TRANSITION_BINDINGS"
            mode="out-in"
          >
            <component
              :is="Component"
              v-if="Component !== null && childRoute !== undefined"
              :key="resolveMainLayoutOutletKey(childRoute)"
            />
          </Transition>
        </router-view>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router'
import { storeToRefs } from 'pinia'

import {
  createFaKeybindKeydownHandler,
  getFaKeybindKeydownContext
} from 'app/src/scripts/keybinds/faKeybindsGlobalDispatch'
import {
  FA_APP_SHELL_DRAWER_TRANSITION_MS,
  FA_APP_SHELL_PAGE_TRANSITION_BINDINGS
} from 'app/src/scripts/appRouting/faAppShellPageTransition'
import { useAppShellLayoutDrawerRail } from 'app/src/layouts/MainLayout/scripts/appShellLayoutDrawerRail'
import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/rendererAppInternals'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { hydrateFromBridgeOrReport } from 'app/src/scripts/stores/faBridgeLoadFailureReporting'

import AppControlMenus from 'app/src/components/globals/AppControlMenus/AppControlMenus.vue'
import GlobalLanguageSelector from 'app/src/components/globals/GlobalLanguageSelector/GlobalLanguageSelector.vue'
import GlobalWindowButtons from 'app/src/components/globals/GlobalWindowButtons/GlobalWindowButtons.vue'

defineOptions({
  name: 'MainLayout'
})

const route = useRoute()

const { activeProject } = storeToRefs(S_FaActiveProject())

/**
 * Router-view slot can pass an undefined 'route' before the nested match is ready (Storybook iframe).
 */
function resolveMainLayoutOutletKey (
  childRoute: RouteLocationNormalizedLoaded | undefined
): string {
  const path = childRoute?.path
  if (typeof path === 'string' && path.length > 0) {
    return path
  }
  return 'app-shell-outlet'
}

const mainLayoutRoutePath = computed((): string => {
  return route?.path ?? '/'
})

const showWorkspaceDrawer = computed((): boolean => {
  return mainLayoutRoutePath.value === '/home'
})

const { appShellLayoutQuasarView } = useAppShellLayoutDrawerRail(showWorkspaceDrawer)

const appShellLayoutRouteClass = computed((): Record<string, boolean> => {
  return {
    'appShellLayout--welcome': !showWorkspaceDrawer.value,
    'appShellLayout--workspace': showWorkspaceDrawer.value
  }
})

const activeProjectLabel = computed((): string | null => {
  const n = activeProject.value?.name
  if (typeof n !== 'string' || n.length === 0) {
    return null
  }
  return n
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

  if (window.faContentBridgeAPIs?.projectManagement !== undefined) {
    await S_FaRecentProjects().refreshRecentProjects()
    await hydrateFromBridgeOrReport(() => S_FaProjectNoteboard().refreshProjectNoteboard())
    await hydrateFromBridgeOrReport(() => S_FaProjectStyling().refreshProjectStyling())
  }

  if (window.faContentBridgeAPIs?.faKeybinds !== undefined) {
    const faKeybindsStore = S_FaKeybinds()
    await hydrateFromBridgeOrReport(() => faKeybindsStore.refreshKeybinds())
    faKeybindKeydownHandler = createFaKeybindKeydownHandler(getFaKeybindKeydownContext)
    window.addEventListener('keydown', faKeybindKeydownHandler, true)
  }

  if (window.faContentBridgeAPIs?.faAppStyling !== undefined) {
    await hydrateFromBridgeOrReport(() => S_FaAppStyling().refreshAppStyling())
  }

  if (window.faContentBridgeAPIs?.faAppNoteboard !== undefined) {
    await S_FaAppNoteboard().refreshNoteboard()
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
  z-index: $mainLayout-appHeader-zIndex;
}

.appShellLayout__pageTransitionHost {
  min-height: 100%;
  pointer-events: none;
  position: relative;
  width: 100%;

  :deep(> *) {
    pointer-events: auto;
  }
}
</style>

<style lang="scss" src="./MainLayout/styles/AppShellLayout.pageTransition.unscoped.scss"></style>
