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
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

function readInitialComponentProps (): Record<string, unknown> {
  const raw = window.faContentBridgeAPIs?.extraEnvVariables?.getCachedSnapshot?.()?.COMPONENT_PROPS
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  return {}
}

/**
 * Passed prop list from the test through Electron backend. If somehow nothing get passed (somehow), set to a blank object just to be on the safe side.
 */
const propList = ref<Record<string, unknown>>(readInitialComponentProps())

/**
 * Current route
 */
const route = useRoute()

/**
 * Resolve all Vue SFCs under src/components from this file (src/pages).
 * A bare "components/" glob is relative to this folder and would wrongly target src/pages/components.
 */
const componentList = (import.meta as ImportMeta & {
  glob: (pattern: string, options: { eager: true }) => Record<string, { default: Component & { __name?: string } }>
}).glob('../components/**/*.vue', { eager: true }) as Record<string, { default: Component & { __name?: string } }>

/**
 * Matched SFC for the route param (must match SFC __name). Computed so navigation finishing after setup still updates.
 */
const currentComponent = computed((): Component | null => {
  const componentNameParam = route.params?.componentName
  const componentName = Array.isArray(componentNameParam)
    ? componentNameParam[0]
    : (componentNameParam ?? '')

  for (const loopPath in componentList) {
    const loopComponent = componentList[loopPath].default
    if (loopComponent.__name === componentName) {
      return loopComponent
    }
  }
  return null
})

onMounted(async () => {
  const bridge = window.faContentBridgeAPIs?.extraEnvVariables
  if (!bridge?.getSnapshot) {
    return
  }
  const snap = await bridge.getSnapshot()
  if (snap.COMPONENT_PROPS) {
    propList.value = snap.COMPONENT_PROPS as Record<string, unknown>
  }
})

</script>
