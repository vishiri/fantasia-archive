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
        :data-input="testData"
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

    <!-- Dialog Popups -->
    <DialogMarkdownDocument />
    <DialogAboutFantasiaArchive />
  </div>
</template>

<script setup lang="ts">

import { testData } from './tests/_testData'

import { project } from 'src/components/AppControlMenus/data/project'
import { documents } from 'src/components/AppControlMenus/data/documents'
import { tools } from 'src/components/AppControlMenus/data/tools'
import { helpInfo } from 'src/components/AppControlMenus/data/helpInfo'

import AppControlSingleMenu from 'app/src/components/AppControlMenus/AppControlSingleMenu/AppControlSingleMenu.vue'
import DialogMarkdownDocument from 'app/src/components/DialogMarkdownDocument/DialogMarkdownDocument.vue'
import DialogAboutFantasiaArchive from 'app/src/components/DialogAboutFantasiaArchive/DialogAboutFantasiaArchive.vue'

/**
 * Testing type currently possibly happening
 */
const testingType = window.extraEnvVariables.TEST_ENV

</script>

<style lang="scss" scoped>
.appControlMenus {
  &__inner {
    -webkit-app-region: no-drag;
  }
}
</style>
