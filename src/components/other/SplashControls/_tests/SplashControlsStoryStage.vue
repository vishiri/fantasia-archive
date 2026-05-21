<template>
  <div
    class="splashControlsStoryStage bg-dark flex flex-center"
    style="min-height: 720px; width: 100%;"
  >
    <SplashControls />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'

import SplashControls from '../SplashControls.vue'

const props = withDefaults(
  defineProps<{
    openResumeMenuOnMount?: boolean
  }>(),
  {
    openResumeMenuOnMount: false
  }
)

onMounted(() => {
  if (props.openResumeMenuOnMount !== true) {
    return
  }

  void (async (): Promise<void> => {
    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, 350)
    })

    const trigger = document.querySelector(
      '[data-test-locator="splashPage-btn-resume-latest"] .q-btn-dropdown__arrow-container'
    )

    if (trigger instanceof HTMLElement) {
      trigger.click()
    }

    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, 750)
    })
  })()
})
</script>
