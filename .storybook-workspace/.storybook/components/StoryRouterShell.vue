<template>
  <router-view v-if="storyRouterReady" />
</template>

<script setup lang="ts">
import type { App } from 'vue'
import { getCurrentInstance, ref, watch } from 'vue'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { STORYBOOK_APP_ROUTES } from '../storybookAppRoutes'

const props = withDefaults(
  defineProps<{
    /** Must match a path registered in 'STORYBOOK_APP_ROUTES'. */
    initialPath?: string
  }>(),
  { initialPath: '/' }
)

const storyRouterReady = ref(false)

function resolveStoryRouter (app: App): Router {
  const g = app.config.globalProperties

  if (g.$router == null) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: STORYBOOK_APP_ROUTES
    })
    app.use(router)
    return router
  }

  return g.$router as Router
}

async function navigateStoryRouter (path: string): Promise<void> {
  const inst = getCurrentInstance()
  if (inst == null) {
    return
  }

  const router = resolveStoryRouter(inst.appContext.app)
  storyRouterReady.value = false
  await router.replace(path)
  await router.isReady()
  storyRouterReady.value = true
}

void navigateStoryRouter(props.initialPath)

watch(
  () => props.initialPath,
  (path) => {
    void navigateStoryRouter(path)
  }
)
</script>
