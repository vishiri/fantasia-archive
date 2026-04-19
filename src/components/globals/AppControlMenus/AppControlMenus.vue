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
        data-test-menu-test="appControlMenus-testMenu"
        data-test-menu-any="appControlMenus-anyMenu"
      />

      <!-- Project menu -->
      <AppControlSingleMenu
        v-if="testingType !== 'components'"
        :data-input="project"
        data-test-menu-any="appControlMenus-anyMenu"
      />

      <!-- Documents menu -->
      <AppControlSingleMenu
        v-if="testingType !== 'components'"
        :data-input="documents"
        data-test-menu-any="appControlMenus-anyMenu"
      />

      <!-- Tools menu -->
      <AppControlSingleMenu
        v-if="testingType !== 'components'"
        :data-input="tools"
        data-test-menu-any="appControlMenus-anyMenu"
      />

      <!-- Help & Info Menu -->
      <AppControlSingleMenu
        v-if="testingType !== 'components'"
        :data-input="helpInfo"
        data-test-menu-any="appControlMenus-anyMenu"
      />
    </q-btn-group>

    <!-- Dialog Popups (optional so mounted surfaces like Storybook can preview the menu bar only) -->
    <DialogMarkdownDocument v-if="embedDialogs" />
    <DialogAboutFantasiaArchive v-if="embedDialogs" />
    <DialogActionMonitor v-if="embedDialogs" />
    <DialogKeybindSettings v-if="embedDialogs" />
    <DialogProgramSettings v-if="embedDialogs" />
  </div>
</template>

<script setup lang="ts">

import { computed, onMounted, ref } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import type { I_appMenuList } from 'app/types/I_appMenusDataList'
import { openDialogMarkdownDocument } from 'src/scripts/appGlobalManagementUI/dialogManagement'
import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/rendererAppInternals'

import { buildDocumentsMenu } from 'app/src/components/globals/AppControlMenus/_data/documents'
import { buildHelpInfoMenu } from 'app/src/components/globals/AppControlMenus/_data/helpInfo'
import { buildProjectMenu } from 'app/src/components/globals/AppControlMenus/_data/project'
import { buildToolsMenu } from 'app/src/components/globals/AppControlMenus/_data/tools'

import AppControlSingleMenu from 'app/src/components/globals/AppControlSingleMenu/AppControlSingleMenu.vue'
import DialogMarkdownDocument from 'app/src/components/dialogs/DialogMarkdownDocument/DialogMarkdownDocument.vue'
import DialogAboutFantasiaArchive from 'app/src/components/dialogs/DialogAboutFantasiaArchive/DialogAboutFantasiaArchive.vue'
import DialogActionMonitor from 'app/src/components/dialogs/DialogActionMonitor/DialogActionMonitor.vue'
import DialogKeybindSettings from 'app/src/components/dialogs/DialogKeybindSettings/DialogKeybindSettings.vue'
import DialogProgramSettings from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.vue'

function readInitialTestingType (): string | false {
  const snap = window.faContentBridgeAPIs?.extraEnvVariables?.getCachedSnapshot?.()
  if (!snap) {
    return ''
  }
  return snap.TEST_ENV ?? ''
}

withDefaults(
  defineProps<{
    /**
     * When true (default), mounts dialogs reached from Help / menu actions. Set false in Storybook to avoid shared Pinia dialog state painting unrelated overlays on the canvas.
     */
    embedDialogs?: boolean
  }>(),
  {
    embedDialogs: !isFantasiaStorybookCanvas()
  }
)

/**
 * Testing type that might be happening right now
 */
const testingType = ref<string | false>(readInitialTestingType())

onMounted(async () => {
  const bridge = window.faContentBridgeAPIs?.extraEnvVariables
  if (bridge?.getSnapshot) {
    const snap = await bridge.getSnapshot()
    testingType.value = snap.TEST_ENV ?? ''
  }
})

const project = computed((): I_appMenuList => {
  void i18n.global.locale.value
  return buildProjectMenu()
})

const documents = computed((): I_appMenuList => {
  void i18n.global.locale.value
  return buildDocumentsMenu()
})

const tools = computed((): I_appMenuList => {
  void i18n.global.locale.value
  return buildToolsMenu()
})

const helpInfo = computed((): I_appMenuList => {
  void i18n.global.locale.value
  return buildHelpInfoMenu()
})

/**
 * Menu payload for TEST_ENV === 'components' embed only — mirrors Playwright scenarios for AppControlMenus.
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
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: 'Test Button 2 - Keybind settings (hint)',
      icon: 'mdi-keyboard-settings',
      keybindCommandId: 'openKeybindSettings',
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
          text: 'Submenu-Test Button 1 - Advanced search guide (hint)',
          icon: 'mdi-file-question',
          keybindCommandId: 'openAdvancedSearchGuide',
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
