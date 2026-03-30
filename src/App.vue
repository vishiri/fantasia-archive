<template>
  <router-view />
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { runAppStartupRouting } from 'app/src/scripts/appInfo/appStartupRouting'

/**
 * Local router variable
 */
const router = useRouter()

/**
 * Testing type currently possibly happening
 */
const testingType = window.faContentBridgeAPIs.extraEnvVariables.TEST_ENV

/**
 * Name of the component being possibly tested via component testing
 */
const testingComponentName = window.faContentBridgeAPIs.extraEnvVariables.COMPONENT_NAME

const normalizedTestingType = testingType || undefined
const normalizedTestingComponentName = testingComponentName || undefined

runAppStartupRouting(router, normalizedTestingType, normalizedTestingComponentName)

</script>
