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
              :key="resolveMainLayoutOutletKeyFromRoute(childRoute)"
            />
          </Transition>
        </router-view>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import AppControlMenus from 'app/src/components/globals/AppControlMenus/AppControlMenus.vue'
import GlobalLanguageSelector from 'app/src/components/globals/GlobalLanguageSelector/GlobalLanguageSelector.vue'
import GlobalWindowButtons from 'app/src/components/globals/GlobalWindowButtons/GlobalWindowButtons.vue'

import { useMainLayout } from './scripts/mainLayout_manager'

defineOptions({
  name: 'MainLayout'
})

const {
  FA_APP_SHELL_DRAWER_TRANSITION_MS,
  FA_APP_SHELL_PAGE_TRANSITION_BINDINGS,
  appShellLayoutQuasarView,
  appShellLayoutRouteClass,
  isFantasiaStorybookCanvas,
  resolveMainLayoutOutletKeyFromRoute,
  showWorkspaceDrawer
} = useMainLayout()
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

<style lang="scss" src="./styles/AppShellLayout.pageTransition.unscoped.scss"></style>
