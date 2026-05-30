import { defineRouter } from '#q-app/wrappers'

import { createFantasiaArchiveRouter } from './scripts/routerIndex_manager'

/*
 * Without SSR you may export the Router instance directly from this factory. The factory may be async (use async/await or return a Promise that resolves with the Router instance).
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  return createFantasiaArchiveRouter
})
