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
      class="appHeader"
    >
      <div class="row items-center no-wrap full-width">
        <AppControlMenus class="col-auto" />
      </div>
    </q-header>

    <GlobalLanguageSelector v-if="!isFantasiaStorybookCanvas()" />

    <GlobalWindowButtons />

    <q-splitter
      v-if="showWorkspaceDrawer"
      v-model="sidebarWidthModel"
      unit="px"
      :limits="[sidebarMinWidthPx, Infinity]"
      class="mainLayoutSidebarSplitter"
      data-test-locator="mainLayout-sidebarSplitter"
      @update:model-value="onSidebarSplitterWidthUpdate"
    >
      <template #before>
        <div
          class="mainLayoutSidebarSplitter__panel"
          data-test-locator="mainLayout-drawer"
        >
          <q-list dark>
            <q-item-label
              header
            >
              {{ $t('mainLayout.drawer.essentialLinksHeader') }}
            </q-item-label>
          </q-list>
        </div>
      </template>

      <template #after>
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
      </template>
    </q-splitter>

    <q-page-container
      v-else
      class="appShellLayout__pageContainer"
    >
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

import { useMainLayout, useMainLayoutWorkspaceSidebar } from './scripts/mainLayout_manager'

defineOptions({
  name: 'MainLayout'
})

const {
  FA_APP_SHELL_PAGE_TRANSITION_BINDINGS,
  appShellLayoutQuasarView,
  appShellLayoutRouteClass,
  isFantasiaStorybookCanvas,
  resolveMainLayoutOutletKeyFromRoute,
  showWorkspaceDrawer
} = useMainLayout()

const {
  onSidebarSplitterWidthUpdate,
  sidebarMinWidthPx,
  sidebarWidthModel
} = useMainLayoutWorkspaceSidebar()
</script>

<style lang="scss" scoped>
@use './styles/variables' as *;

.appHeader {
  -webkit-app-region: drag;
  background-color: $mainLayout-appHeader-backgroundColor;
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
<style lang="scss" src="./styles/MainLayoutSidebarSplitter.unscoped.scss"></style>
