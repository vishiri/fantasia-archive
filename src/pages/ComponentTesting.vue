<template>
  <q-page class="row items-center justify-evenly">
    <component
      :is="currentComponent"
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
const propList = (window.faContentBridgeAPIs.extraEnvVariables.COMPONENT_PROPS)
  ? window.faContentBridgeAPIs.extraEnvVariables.COMPONENT_PROPS
  : {}

/**
 * Current route
 */
const route = useRoute()

/**
 * Currently tested component's name based on the last part of the route
 */
const componentName = route.params.componentName

/**
 * Auto-import all components from the automatic matching via the route path
 */
const componentList = import.meta.globEager('components/**/*.vue')

/**
 * Placeholder variable for the matched component
 */
let currentComponent: Component

/**
 * Loops through the component list
 */
for (const loopPath in componentList) {
  /**
   * Current component from the loop
   */
  const loopComponent = componentList[loopPath].default

  /**
   * If the route-component-name matches the name of component in the loop, load it as the curently displayed one
   */
  if (loopComponent.__name === componentName) {
    currentComponent = loopComponent
  }
}

</script>
