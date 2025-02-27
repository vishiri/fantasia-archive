<template>
  <router-view />
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { tipsTricksTriviaNotification } from 'app/src/scripts/appInfo/tipsTricksTriviaNotification'

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

/**
 * Determine if some testing is happening
 */
const isComponentTesting = (testingType && testingType === 'components' && testingComponentName)

/**
 * In case of some testing happening:
 * - Reroute to the proper component path route assuming all is properly set.
 * - Otherwise, make sure we are on homepage on load.
 */
if (isComponentTesting) {
  router.push({ path: `/componentTesting/${testingComponentName}` })
} else {
  router.push({ path: '/' })
  // TODO add checking if "Did you know" popup should show
  // TODO add checking if "Did you know" popup should be showing a mascot or an icon
  tipsTricksTriviaNotification(false)
}

</script>
