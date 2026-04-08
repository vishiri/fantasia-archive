<template>
  <q-layout view="hHh Lpr lFf">
    <q-header
      elevated
      dark
      class="bg-dark appHeader"
    >
      <AppControlMenus />
    </q-header>

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
import GlobalWindowButtons from 'components/globals/GlobalWindowButtons/GlobalWindowButtons.vue'
import AppControlMenus from 'components/globals/AppControlMenus/AppControlMenus.vue'

</script>

<style lang="scss" scoped>
.appHeader {
  -webkit-app-region: drag;

  // Tweak, so the menus will slide nicely behind/from behind the top bar
  z-index: $mainLayout-appHeader-zIndex;
}
</style>
