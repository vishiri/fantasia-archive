<template>
  <q-layout>
    <q-page-container>
      <router-view :key="route.path" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useComponentTestingLayout } from './scripts/componentTestingLayout_manager'

const { route } = useComponentTestingLayout()
</script>
