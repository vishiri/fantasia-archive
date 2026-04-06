import { defineStore as defineQuasarStore } from '#q-app/wrappers'
import { createPinia } from 'pinia'

/*
 * Without SSR you may export the Pinia instance directly from this factory. The factory may be async (use async/await or return a Promise that resolves with the configured Pinia instance).
 */

export default defineQuasarStore((/* { ssrContext } */) => {
  const pinia = createPinia()

  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)

  return pinia
})
