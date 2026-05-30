<template>
  <q-page class="row items-center justify-evenly">
    <component
      :is="currentComponent"
      v-if="currentComponent !== null"
      v-bind="propList"
    />
  </q-page>
</template>

<script lang="ts" setup>
import type { T_componentTestingSfcModule } from 'app/types/I_componentTestingHarness'
import { useComponentTesting } from './scripts/componentTesting_manager'

const componentList = (import.meta as ImportMeta & {
  glob: (pattern: string, options: { eager: true }) => Record<string, T_componentTestingSfcModule>
}).glob('../../components/**/*.vue', { eager: true }) as Record<string, T_componentTestingSfcModule>

const {
  currentComponent,
  propList
} = useComponentTesting(componentList)
</script>
