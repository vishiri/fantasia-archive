<template>
  <div
    class="appControlMenus bg-dark"
  >
    <q-btn-group
      flat
      class="appControlMenus__inner"
    >
      <!-- Test data menu - FOR COMPONENT TEST PURPOSES ONLY -->
      <AppControlSingleMenu
        v-if="testingType === 'components'"
        :data-input="componentTestingMenuList"
        data-test-test-menu="appControlMenus-testMenu"
        data-test-any-menu="appControlMenus-anyMenu"
      />

      <!-- Project menu -->
      <AppControlSingleMenu
        v-if="testingType !== 'components'"
        :data-input="project"
        data-test-any-menu="appControlMenus-anyMenu"
      />

      <!-- Documents menu -->
      <AppControlSingleMenu
        v-if="testingType !== 'components'"
        :data-input="documents"
        data-test-any-menu="appControlMenus-anyMenu"
      />

      <!-- Tools menu -->
      <AppControlSingleMenu
        v-if="testingType !== 'components'"
        :data-input="tools"
        data-test-any-menu="appControlMenus-anyMenu"
      />

      <!-- Help & Info Menu -->
      <AppControlSingleMenu
        v-if="testingType !== 'components'"
        :data-input="helpInfo"
        data-test-any-menu="appControlMenus-anyMenu"
      />
    </q-btn-group>

    <!-- Dialog Popups (optional so mounted surfaces like Storybook can preview the menu bar only) -->
    <DialogMarkdownDocument v-if="embedDialogs" />
    <DialogAboutFantasiaArchive v-if="embedDialogs" />
  </div>
</template>

<script setup lang="ts">

import type { I_appMenuList } from 'app/types/I_appMenusDataList'
import { openDialogMarkdownDocument } from 'src/scripts/appInfo/openDialogMarkdownDocument'

import { project } from 'app/src/components/AppControlMenus/_data/project'
import { documents } from 'app/src/components/AppControlMenus/_data/documents'
import { tools } from 'app/src/components/AppControlMenus/_data/tools'
import { helpInfo } from 'app/src/components/AppControlMenus/_data/helpInfo'

import AppControlSingleMenu from 'app/src/components/AppControlSingleMenu/AppControlSingleMenu.vue'
import DialogMarkdownDocument from 'app/src/components/DialogMarkdownDocument/DialogMarkdownDocument.vue'
import DialogAboutFantasiaArchive from 'app/src/components/DialogAboutFantasiaArchive/DialogAboutFantasiaArchive.vue'

withDefaults(
  defineProps<{
    /**
     * When true (default), mounts dialogs reached from Help / menu actions. Set false in Storybook to avoid shared Pinia dialog state painting unrelated overlays on the canvas.
     */
    embedDialogs?: boolean
  }>(),
  {
    embedDialogs: true
  }
)

/**
 * Testing type that might be happening right now
 */
const testingType = window.faContentBridgeAPIs?.extraEnvVariables?.TEST_ENV ?? ''

/**
 * Menu payload for `TEST_ENV === 'components'` embed only — mirrors Playwright scenarios for AppControlMenus.
 */
const componentTestingMenuList: I_appMenuList = {
  title: 'Test Title',
  data: [
    {
      mode: 'item',
      text: 'Test Button 1 - Open Dialog with Markdown document',
      icon: 'mdi-text-box-plus-outline',
      submenu: undefined,
      trigger: () => openDialogMarkdownDocument('changeLog'),
      triggerArguments: ['changeLog'],
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: 'Test Button 2',
      icon: 'mdi-database-search',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'separator'
    },
    {
      mode: 'item',
      text: 'Test Button 3 - Secondary',
      icon: 'mdi-text-box-remove-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: 'secondary'
    },
    {
      mode: 'separator'
    },
    {
      mode: 'item',
      text: 'Test Button 4',
      icon: 'mdi-page-layout-sidebar-left',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: 'Test Button 5',
      icon: 'mdi-clipboard-text-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },

    {
      mode: 'separator'
    },
    {
      mode: 'item',
      text: 'Test Button 6 - Grey, Submenu',
      icon: 'keyboard_arrow_right',
      trigger: undefined,
      conditions: true,
      specialColor: 'grey',
      submenu: [
        {
          mode: 'item',
          text: 'Submenu-Test Button 1',
          icon: 'mdi-folder-plus-outline',
          trigger: undefined,
          conditions: true,
          specialColor: undefined
        },
        {
          mode: 'separator'
        },
        {
          mode: 'item',
          text: 'Submenu-Test Button 2 - Secondary',
          icon: 'mdi-wrench',
          trigger: undefined,
          conditions: true,
          specialColor: 'secondary'
        }
      ]

    }
  ]
}

</script>

<style lang="scss" scoped>
.appControlMenus {
  &__inner {
    -webkit-app-region: no-drag;
  }
}
</style>
