<template>
  <div
    class="appControlMenus"
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

      <!-- Help & Info menu -->
      <AppControlSingleMenu
        v-if="testingType !== 'components'"
        :data-input="helpInfo"
        data-test-menu-any="appControlMenus-anyMenu"
      />
    </q-btn-group>

    <FaModalAndFloatingWindowHost v-if="embedDialogs" />
  </div>
</template>

<script setup lang="ts">

import AppControlSingleMenu from 'app/src/components/globals/AppControlSingleMenu/AppControlSingleMenu.vue'
import FaModalAndFloatingWindowHost from 'app/src/components/globals/_FaModalAndFloatingWindowHost/_FaModalAndFloatingWindowHost.vue'

import {
  appControlMenusEmbedDialogsDefault,
  useAppControlMenus
} from './scripts/appControlMenus_manager'

const {
  componentTestingMenuList,
  documents,
  helpInfo,
  project,
  testingType,
  tools
} = useAppControlMenus()

withDefaults(
  defineProps<{
    /**
     * When true (default), mounts dialogs reached from Help / menu actions. Set false in Storybook to avoid shared Pinia dialog state painting unrelated overlays on the canvas.
     */
    embedDialogs?: boolean
  }>(),
  {
    embedDialogs: appControlMenusEmbedDialogsDefault
  }
)

</script>

<style lang="scss" scoped>
.appControlMenus {
  background-color: $appControlMenus-barBackgroundColor;
  flex-shrink: 0;
  min-width: $appControlMenus-barMinWidth;

  &__inner {
    -webkit-app-region: no-drag;

    // Adjust for global window chrome offset in order to make the menu clickable when mouse hover the left top corner of the window
    margin-left: $appControlMenus-inner-marginLeft;
  }
}
</style>
