import type { Plugin } from 'vue'
import { defineBoot } from '#q-app/wrappers'
import VuePlugin from '@quasar/quasar-ui-qmarkdown'
import '@quasar/quasar-ui-qmarkdown/dist/index.css'

export default defineBoot(({ app }) => {
  app.use(VuePlugin as unknown as Plugin)
})
