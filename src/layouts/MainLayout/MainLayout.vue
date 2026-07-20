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
      <div
        class="appHeader__inner row items-center no-wrap full-width"
        :class="{ 'appHeader__inner--spellcheckRefreshVisible': faAppHeaderChromeSpellcheckRefreshVisible }"
      >
        <AppControlMenus class="col-auto" />
        <div
          class="col appHeader__tabsRegion"
          data-test-locator="mainLayout-appControlBarHeaderMount"
        />
      </div>
    </q-header>

    <GlobalLanguageSelector v-if="!isFantasiaStorybookCanvas()" />

    <GlobalWindowButtons />

    <q-splitter
      v-if="showWorkspaceDrawer"
      :model-value="sidebarSplitterModelValue"
      unit="px"
      :limits="sidebarSplitterLimits"
      class="mainLayoutSidebarSplitter"
      data-test-locator="mainLayout-sidebarSplitter"
      @update:model-value="onSidebarSplitterModelUpdate"
    >
      <template
        v-if="!hideHierarchyTree"
        #before
      >
        <div
          ref="workspaceSidebarPanelRef"
          class="mainLayoutSidebarSplitter__panel"
          data-test-locator="mainLayout-drawer"
        >
          <ProjectHierarchyTreeSearch />
          <div class="mainLayoutSidebarSplitter__panelBody">
            <ProjectHierarchyTree
              @document-open-request="handleMainLayoutWorkspaceDocumentOpenRequest"
            />
          </div>
        </div>
      </template>

      <template #after>
        <q-page-container class="appShellLayout__pageContainer">
          <ProjectAppControlBar v-if="showWorkspaceDrawer" />
          <div class="appShellLayout__pageTransitionHost">
            <router-view v-slot="{ Component, route: childRoute }">
              <Transition
                v-bind="appShellPageTransitionBindingProps"
                :mode="appShellPageTransitionMode"
                appear
              >
                <div
                  v-if="Component !== null && childRoute !== undefined"
                  :key="resolveMainLayoutOutletKeyFromRoute(childRoute)"
                  class="appShellLayout__pageTransitionLayer"
                >
                  <component :is="Component" />
                </div>
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
            v-bind="appShellPageTransitionBindingProps"
            :mode="appShellPageTransitionMode"
            appear
          >
            <div
              v-if="Component !== null && childRoute !== undefined"
              :key="resolveMainLayoutOutletKeyFromRoute(childRoute)"
              class="appShellLayout__pageTransitionLayer"
            >
              <component :is="Component" />
            </div>
          </Transition>
        </router-view>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import AppControlMenus from 'app/src/components/globals/AppControlMenus/AppControlMenus.vue'
import GlobalLanguageSelector from 'app/src/components/globals/GlobalLanguageSelector/GlobalLanguageSelector.vue'
import GlobalWindowButtons from 'app/src/components/globals/GlobalWindowButtons/GlobalWindowButtons.vue'
import ProjectAppControlBar from 'app/src/components/projectUI/ProjectAppControlBar/ProjectAppControlBar.vue'
import ProjectHierarchyTree from 'app/src/components/projectUI/ProjectHierarchyTree/ProjectHierarchyTree.vue'
import ProjectHierarchyTreeSearch from 'app/src/components/projectUI/ProjectHierarchyTreeSearch/ProjectHierarchyTreeSearch.vue'

import { useMainLayout, useMainLayoutWorkspaceSidebar } from './scripts/mainLayout_manager'
import { useMainLayoutHideHierarchyTree } from './scripts/mainLayoutHideHierarchyTreeWiring'
import { handleMainLayoutWorkspaceDocumentOpenRequest } from './scripts/mainLayoutWorkspaceDocumentOpenWiring'
import { useFaAppHeaderChromeSpellcheckRefreshVisible } from 'app/src/components/globals/GlobalLanguageSelector/scripts/faAppHeaderChromeSpellcheckReserveWiring'

defineOptions({
  name: 'MainLayout'
})

const {
  appShellPageTransitionBindingProps,
  appShellPageTransitionMode,
  appShellLayoutQuasarView,
  appShellLayoutRouteClass,
  isFantasiaStorybookCanvas,
  resolveMainLayoutOutletKeyFromRoute,
  showWorkspaceDrawer
} = useMainLayout()

const {
  onSidebarSplitterWidthUpdate,
  sidebarMinWidthPx,
  sidebarWidthModel,
  workspaceSidebarPanelRef
} = useMainLayoutWorkspaceSidebar()

const { hideHierarchyTree } = useMainLayoutHideHierarchyTree()

const sidebarSplitterLimits = computed((): [number, number] => {
  if (hideHierarchyTree.value) {
    return [0, Infinity]
  }
  return [sidebarMinWidthPx, Infinity]
})

const sidebarSplitterModelValue = computed((): number => {
  if (hideHierarchyTree.value) {
    return 0
  }
  return sidebarWidthModel.value
})

function onSidebarSplitterModelUpdate (widthPx: number): void {
  if (hideHierarchyTree.value) {
    return
  }
  sidebarWidthModel.value = widthPx
  onSidebarSplitterWidthUpdate(widthPx)
}

const faAppHeaderChromeSpellcheckRefreshVisible = useFaAppHeaderChromeSpellcheckRefreshVisible()
</script>

<style lang="scss" scoped>
@use './styles/variables' as *;

.appHeader {
  -webkit-app-region: drag;
  background-color: $mainLayout-appHeader-backgroundColor;
  z-index: $mainLayout-appHeader-zIndex;
}

.appHeader__inner {
  padding-right: $mainLayout-appHeader-chromeRightReserveBasePx;
  width: 100%;
}

.appHeader__inner--spellcheckRefreshVisible {
  padding-right: $mainLayout-appHeader-chromeRightReserveWithSpellcheckPx;
}

.appHeader__tabsRegion {
  max-width: 100%;
  min-height: $mainLayout-appHeader-heightPx;
  min-width: 0;
  overflow: hidden;
}

.appShellLayout__pageTransitionHost {
  min-height: 100%;
  overflow: hidden;
  pointer-events: none;
  position: relative;
  width: 100%;

  :deep(> *) {
    min-height: inherit;
    pointer-events: auto;
  }
}

.appShellLayout__pageTransitionLayer {
  min-height: inherit;
  width: 100%;
}
</style>

<style lang="scss" src="./styles/AppShellLayout.pageTransition.unscoped.scss"></style>
<style lang="scss" src="./styles/DocumentWorkspacePage.pageTransition.unscoped.scss"></style>
<style lang="scss" src="./styles/MainLayoutSidebarSplitter.unscoped.scss"></style>
