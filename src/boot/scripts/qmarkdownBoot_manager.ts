import type { I_vuePlugin } from 'app/types/I_vueCompositionShims'

import VuePlugin from '@quasar/quasar-ui-qmarkdown'
import '@quasar/quasar-ui-qmarkdown/dist/index.css'

import { createRunQmarkdownBoot } from './functions/createRunQmarkdownBoot'

export const runQmarkdownBoot = createRunQmarkdownBoot({
  VuePlugin: VuePlugin as unknown as I_vuePlugin
})
