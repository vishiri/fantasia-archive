<template>
  <router-view />
</template>

<script setup lang="ts">
import { getCurrentInstance, watch } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { STORYBOOK_APP_ROUTES } from '../storybookAppRoutes'

const props = withDefaults(
  defineProps<{
    /** Must match a path registered in `STORYBOOK_APP_ROUTES`. */
    initialPath?: string
  }>(),
  { initialPath: '/' }
)

const inst = getCurrentInstance()
if (inst != null) {
  const app = inst.appContext.app
  const g = app.config.globalProperties

  if (g.$router == null) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: STORYBOOK_APP_ROUTES
    })
    app.use(router)
    void router.replace(props.initialPath)
  } else {
    const existing = g.$router as { replace: (loc: string) => Promise<unknown> }
    void existing.replace(props.initialPath)
  }
}

watch(
  () => props.initialPath,
  (path) => {
    const inst2 = getCurrentInstance()
    if (inst2 == null) return
    const router = inst2.appContext.config.globalProperties.$router as
      | { replace: (loc: string) => Promise<unknown> }
      | undefined
    if (router != null) {
      void router.replace(path)
    }
  }
)
</script>
