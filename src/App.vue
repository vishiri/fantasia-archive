<template>
  <FaUserCssInjector v-if="mountUserCssInjector" />
  <FaProjectUserCssInjector v-if="mountUserCssInjector" />
  <router-view />
</template>

<script lang="ts" setup>
import FaUserCssInjector from 'app/src/components/globals/_FaUserCssInjector/_FaUserCssInjector.vue'
import FaProjectUserCssInjector from 'app/src/components/globals/_FaProjectUserCssInjector/_FaProjectUserCssInjector.vue'

import { useApp } from 'app/src/scripts/app_manager'

const { mountUserCssInjector } = useApp()
</script>
