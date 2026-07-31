<template>
  <q-layout>
    <!--
      Same Teleport target as MainLayout header tabs region so ProjectAppControlBarOpenedTabs
      (and any other header Teleport) mounts under component-testing without a missing-target
      unmount crash when navigating to /home.
    -->
    <div
      class="componentTestingLayout__appControlBarHeaderMount"
      data-test-locator="mainLayout-appControlBarHeaderMount"
    />
    <q-page-container>
      <router-view :key="route.path" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useComponentTestingLayout } from './scripts/componentTestingLayout_manager'

const { route } = useComponentTestingLayout()
</script>
