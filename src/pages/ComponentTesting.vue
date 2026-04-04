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
import type { Component } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Passed prop list from the test through Electron backend. If somehow nothing get passed (somehow), set to a blank object just to be on the safe side.
 */
const propList = (window.faContentBridgeAPIs?.extraEnvVariables?.COMPONENT_PROPS)
  ? window.faContentBridgeAPIs.extraEnvVariables.COMPONENT_PROPS
  : {}

/**
 * Current route
 */
const route = useRoute()

/**
 * Currently tested component's name based on the last part of the route
 * (must match SFC __name, i.e. the file basename without '.vue').
 */
const componentNameParam = route?.params?.componentName
const componentName = Array.isArray(componentNameParam)
  ? componentNameParam[0]
  : (componentNameParam ?? '')

/**
 * Resolve all Vue SFCs under src/components from this file (src/pages).
 * A bare "components/" glob is relative to this folder and would wrongly target src/pages/components.
 */
const componentList = (import.meta as ImportMeta & {
  glob: (pattern: string, options: { eager: true }) => Record<string, { default: Component & { __name?: string } }>
}).glob('../components/**/*.vue', { eager: true })

/**
 * Placeholder variable for the matched component
 */
let currentComponent: Component | null = null

for (const loopPath in componentList) {
  const loopComponent = componentList[loopPath].default
  if (loopComponent.__name === componentName) {
    currentComponent = loopComponent
  }
}

</script>
